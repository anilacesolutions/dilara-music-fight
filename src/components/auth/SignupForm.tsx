"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { signup } from "@/app/actions/auth";
import { useLocale, useUi } from "@/i18n/client";
import { Link } from "@/i18n/link";
import { GENRES, MAX_GENRES, genreLabel } from "@/lib/catalog";
import { initialSignupState } from "@/lib/form-state";
import { MIN_SIGNUP_AGE, MIN_SIGNUP_GENRES } from "@/lib/rules";
import { FormField } from "./FormField";

export function SignupForm({ maxBirthDate }: { maxBirthDate: string }) {
  const [state, action, pending] = useActionState(signup, initialSignupState);
  const [showPassword, setShowPassword] = useState(false);
  const [genres, setGenres] = useState<string[]>(initialSignupState.values.genres);
  const { errors, values } = state;
  const passwordType = showPassword ? "text" : "password";
  const locale = useLocale();
  const t = useUi().signup;

  /**
   * A rejected field can be far above the button that was just pressed, and on
   * a phone it is off screen entirely, so the form looks like it did nothing.
   * Take the reader to the first thing that needs fixing.
   */
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    const [field] = Object.keys(errors);
    if (!field) return;
    const target = formRef.current?.querySelector<HTMLElement>(
      field === "form" ? "[data-form-error]" : `[name="${field}"], [data-field="${field}"]`,
    );
    if (!target) return;
    target.scrollIntoView({ behavior: "smooth", block: "center" });
    if (target instanceof HTMLInputElement) target.focus({ preventScroll: true });
  }, [state, errors]);

  function toggleGenre(id: string) {
    setGenres((current) => {
      if (current.includes(id)) return current.filter((genre) => genre !== id);
      return current.length >= MAX_GENRES ? current : [...current, id];
    });
  }

  return (
    <form ref={formRef} action={action} className="space-y-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label={t.firstName} name="firstName" autoComplete="given-name" defaultValue={values.firstName} error={errors.firstName} />
        <FormField label={t.lastName} name="lastName" autoComplete="family-name" defaultValue={values.lastName} error={errors.lastName} />
      </div>

      <FormField
        label={t.nickname}
        name="nickname"
        autoComplete="username"
        defaultValue={values.nickname}
        error={errors.nickname}
        hint={t.nicknameHint}
      />

      <FormField label={t.email} name="email" type="email" autoComplete="email" defaultValue={values.email} error={errors.email} />

      <FormField
        label={t.birthDate}
        name="birthDate"
        type="date"
        max={maxBirthDate}
        defaultValue={values.birthDate}
        error={errors.birthDate}
        hint={t.birthDateHint(MIN_SIGNUP_AGE)}
      />

      <fieldset>
        <legend className="mb-1.5 block text-sm font-semibold">
          {t.genres}
          <span className="ml-2 text-xs font-normal text-muted">
            {t.genresCount(genres.length, MAX_GENRES, MIN_SIGNUP_GENRES)}
          </span>
        </legend>
        <div className="flex flex-wrap gap-2">
          {GENRES.map((genre) => {
            const on = genres.includes(genre.id);
            const full = !on && genres.length >= MAX_GENRES;
            return (
              <label
                key={genre.id}
                className={`rounded-full border px-3 py-1.5 text-sm transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-volt-300 ${
                  on ? "border-accent bg-accent/20 text-foreground" : "border-line text-ink-300 hover:border-ink-500"
                } ${full ? "cursor-not-allowed opacity-40" : "cursor-pointer"}`}
              >
                <input
                  type="checkbox"
                  name="genres"
                  value={genre.id}
                  checked={on}
                  disabled={full}
                  onChange={() => toggleGenre(genre.id)}
                  className="sr-only"
                />
                {genreLabel(genre.id, locale)}
              </label>
            );
          })}
        </div>
        <p data-field="genres" className={`mt-1.5 text-xs ${errors.genres ? "text-blaze" : "text-muted"}`}>
          {errors.genres ?? t.genresHint}
        </p>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          label={t.password}
          name="password"
          type={passwordType}
          autoComplete="new-password"
          error={errors.password}
          hint={t.passwordHint}
        />
        <FormField
          label={t.passwordConfirm}
          name="passwordConfirm"
          type={passwordType}
          autoComplete="new-password"
          error={errors.passwordConfirm}
        />
      </div>

      <label className="flex w-fit cursor-pointer items-center gap-2 text-xs text-muted">
        <input
          type="checkbox"
          checked={showPassword}
          onChange={(event) => setShowPassword(event.target.checked)}
          className="h-3.5 w-3.5 accent-volt-500"
        />
        {t.showPassword}
      </label>

      <div>
        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-line bg-surface-2/50 p-3 text-sm text-ink-200">
          <input type="checkbox" name="kvkk" className="mt-0.5 h-4 w-4 shrink-0 accent-volt-500" />
          <span>
            {t.kvkkBefore}
            <Link href="/kvkk" target="_blank" className="font-semibold text-volt-300 underline">
              {t.kvkkLink}
            </Link>
            {t.kvkkAfter}
          </span>
        </label>
        {errors.kvkk && <p data-field="kvkk" className="mt-1.5 text-xs text-blaze">{errors.kvkk}</p>}
      </div>

      {errors.form && (
        <p role="alert" data-form-error className="rounded-xl border border-blaze/40 bg-blaze/10 px-3 py-2 text-sm text-blaze">
          {errors.form}
        </p>
      )}

      <button type="submit" disabled={pending} className="btn btn-primary w-full py-3.5 text-base">
        {pending ? t.submitting : t.submit}
      </button>

      <p className="text-center text-sm text-muted">
        {t.haveAccount}{" "}
        <Link href="/login" className="font-semibold text-foreground hover:underline">
          {t.loginLink}
        </Link>
      </p>
    </form>
  );
}
