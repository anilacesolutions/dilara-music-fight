import { redirect } from "next/navigation";
import { currentLocale } from "@/i18n/server";
import { requireUser } from "@/lib/auth";

/** /profile is a shortcut to your own public profile. */
export default async function MyProfilePage() {
  const [user, locale] = await Promise.all([requireUser("/profile"), currentLocale()]);
  redirect(`/${locale}/profile/${user.nickname}`);
}
