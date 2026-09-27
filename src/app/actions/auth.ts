"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { cookieLocale } from "@/i18n/server";
import { SITE, type Site } from "@/i18n/site";
import { safeReturnPath } from "@/lib/auth";
import { MAX_GENRES, isGenreId } from "@/lib/catalog";
import type { LoginState, SignupField, SignupState } from "@/lib/form-state";
import { MIN_SIGNUP_AGE, MIN_SIGNUP_GENRES } from "@/lib/rules";
import { createSession, destroySession } from "@/lib/session";
import { ageInYears, parseCalendarDate } from "@/lib/time";
import { authenticate, createUser } from "@/lib/users";

type Validation = Site["validation"];

/**
 * Built per request rather than at module scope: the wording depends on the
 * reader's language, which Server Actions take from the locale cookie.
 */
function signupSchema(v: Validation) {
  return z.object({
    firstName: z.string().min(2, { error: v.firstNameMin }).max(40, { error: v.firstNameMax }),
    lastName: z.string().min(2, { error: v.lastNameMin }).max(40, { error: v.lastNameMax }),
    nickname: z.string().regex(/^[A-Za-z0-9_]{3,20}$/, { error: v.nickname }),
    email: z.email({ error: v.email }),
    birthDate: z.string().min(1, { error: v.birthDateRequired }),
    password: z
      .string()
      .min(8, { error: v.passwordMin })
      .max(128, { error: v.passwordMax })
      .regex(/\p{L}/u, { error: v.passwordLetter })
      .regex(/\d/, { error: v.passwordDigit }),
    passwordConfirm: z.string(),
    kvkk: z.literal("on", { error: v.kvkk }),
  });
}

function text(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

/**
 * Every account needs a few genres: a match's opening genre is drawn from what
 * the two players have in common, so an empty list leaves nothing to agree on.
 */
function genresError(genres: string[], v: Validation): string | null {
  if (genres.some((id) => !isGenreId(id))) return v.genreNotInList;
  if (genres.length < MIN_SIGNUP_GENRES) return v.genresMin(MIN_SIGNUP_GENRES);
  if (genres.length > MAX_GENRES) return v.genresMax(MAX_GENRES);
  return null;
}

function birthDateError(value: string, v: Validation): string | null {
  const date = parseCalendarDate(value);
  if (!date) return v.birthDateInvalid;
  if (date > new Date()) return v.birthDateFuture;

  const age = ageInYears(value);
  if (age > 120) return v.birthDateInvalid;
  if (age < MIN_SIGNUP_AGE) return v.tooYoung(MIN_SIGNUP_AGE);
  return null;
}

export async function signup(_previous: SignupState, formData: FormData): Promise<SignupState> {
  const locale = await cookieLocale();
  const v = SITE[locale].validation;

  const raw = {
    firstName: text(formData, "firstName"),
    lastName: text(formData, "lastName"),
    nickname: text(formData, "nickname"),
    email: text(formData, "email"),
    birthDate: text(formData, "birthDate"),
    // Passwords are taken exactly as typed.
    password: String(formData.get("password") ?? ""),
    passwordConfirm: String(formData.get("passwordConfirm") ?? ""),
    kvkk: text(formData, "kvkk"),
  };
  const genres = [...new Set(formData.getAll("genres").filter((value): value is string => typeof value === "string"))];
  const values = {
    firstName: raw.firstName,
    lastName: raw.lastName,
    nickname: raw.nickname,
    email: raw.email,
    birthDate: raw.birthDate,
    genres,
  };

  const errors: SignupState["errors"] = {};
  const parsed = signupSchema(v).safeParse(raw);
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as SignupField | undefined;
      if (field && !errors[field]) errors[field] = issue.message;
    }
  }

  if (!errors.passwordConfirm && raw.password !== raw.passwordConfirm) {
    errors.passwordConfirm = v.passwordMismatch;
  }
  if (!errors.birthDate) {
    const problem = birthDateError(raw.birthDate, v);
    if (problem) errors.birthDate = problem;
  }

  const genreProblem = genresError(genres, v);
  if (genreProblem) errors.genres = genreProblem;

  const birthDate = parseCalendarDate(raw.birthDate);
  if (!parsed.success || !birthDate || Object.keys(errors).length > 0) {
    return { errors, values };
  }

  const result = await createUser({
    firstName: parsed.data.firstName,
    lastName: parsed.data.lastName,
    nickname: parsed.data.nickname,
    email: parsed.data.email,
    birthDate,
    password: parsed.data.password,
    genres,
  });
  if (!result.ok) {
    return {
      errors: { [result.field]: result.field === "email" ? v.emailTaken : v.nicknameTaken },
      values,
    };
  }

  // Signing up doesn't sign you in: the player logs in with the new account next.
  redirect(`/${locale}/login?welcome=1&nickname=${encodeURIComponent(parsed.data.nickname)}`);
}

export async function login(_previous: LoginState, formData: FormData): Promise<LoginState> {
  const locale = await cookieLocale();
  const v = SITE[locale].validation;
  const nickname = text(formData, "nickname");
  const password = String(formData.get("password") ?? "");

  if (!nickname || !password) {
    return { error: v.loginMissing, nickname };
  }

  const userId = await authenticate(nickname, password);
  if (!userId) {
    return { error: v.loginWrong, nickname };
  }

  await createSession(userId);
  redirect(`/${locale}${safeReturnPath(formData.get("next")) ?? "/lobby"}`);
}

export async function logout(): Promise<void> {
  const locale = await cookieLocale();
  await destroySession();
  redirect(`/${locale}`);
}
