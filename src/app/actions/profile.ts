"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { translateError } from "@/i18n/errors";
import { cookieLocale } from "@/i18n/server";
import { SITE } from "@/i18n/site";
import { getCurrentUser } from "@/lib/auth";
import { GameError } from "@/lib/errors";
import type { ProfileState } from "@/lib/form-state";
import { unblockUser, updateProfile } from "@/lib/users";

export async function saveProfile(_previous: ProfileState, formData: FormData): Promise<ProfileState> {
  const locale = await cookieLocale();
  // Identity comes from the session, never from the form.
  const user = await getCurrentUser();
  if (!user) redirect(`/${locale}/login`);

  try {
    await updateProfile(
      user.id,
      String(formData.get("avatar") ?? ""),
      formData.getAll("genres").map(String),
    );
  } catch (error) {
    if (error instanceof GameError) {
      return { status: "error", message: translateError(locale, error.key, error.params) };
    }
    throw error;
  }

  refresh();
  return { status: "saved", message: SITE[locale].profilePage.saved };
}

/** Lets someone read a person's chat messages again. Bound to a nickname by the caller. */
export async function unblock(nickname: string): Promise<void> {
  const user = await getCurrentUser();
  if (!user) redirect(`/${await cookieLocale()}/login`);

  await unblockUser(user.id, nickname);
  refresh();
}
