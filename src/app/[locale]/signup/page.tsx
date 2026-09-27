import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SignupForm } from "@/components/auth/SignupForm";
import { currentLocale, getSite } from "@/i18n/server";
import { getCurrentUser } from "@/lib/auth";
import { MIN_SIGNUP_AGE } from "@/lib/rules";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getSite()).meta.signup };
}

/** Latest birth date that is old enough today, in Istanbul, as YYYY-MM-DD. */
function latestAllowedBirthDate(): string {
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Istanbul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  const [year, month, day] = today.split("-");
  return `${Number(year) - MIN_SIGNUP_AGE}-${month}-${day}`;
}

export default async function SignupPage() {
  const locale = await currentLocale();
  if (await getCurrentUser()) redirect(`/${locale}/lobby`);

  const t = (await getSite()).signupPage;

  return (
    <main className="mx-auto grid w-full max-w-5xl flex-1 items-center gap-10 px-4 py-12 lg:grid-cols-[1fr_1.1fr]">
      <div className="animate-rise-in hidden lg:block">
        <p className="eyebrow">{t.eyebrow}</p>
        <h1 className="mt-3 font-display text-4xl font-black leading-tight">
          {t.titleBefore}
          <span className="text-gradient">{t.titleAccent}</span>
          {t.titleAfter}
        </h1>
        <p className="mt-4 text-ink-300">{t.body}</p>
      </div>

      <div className="panel p-6 sm:p-8">
        <h1 className="font-display text-2xl font-bold lg:hidden">{t.formTitleMobile}</h1>
        <h2 className="hidden font-display text-2xl font-bold lg:block">{t.formTitle}</h2>
        <p className="mb-6 mt-1 text-sm text-muted">{t.formNote}</p>
        <SignupForm maxBirthDate={latestAllowedBirthDate()} />
      </div>
    </main>
  );
}
