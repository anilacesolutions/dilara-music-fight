import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SignupTracker } from "@/components/analytics/SignupTracker";
import { LoginForm } from "@/components/auth/LoginForm";
import { currentLocale, getSite } from "@/i18n/server";
import { getCurrentUser, safeReturnPath } from "@/lib/auth";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getSite()).meta.login };
}

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

export default async function LoginPage({ searchParams }: PageProps<"/[locale]/login">) {
  const params = await searchParams;
  const next = safeReturnPath(first(params.next));
  const locale = await currentLocale();

  if (await getCurrentUser()) redirect(`/${locale}${next ?? "/lobby"}`);

  const welcome = first(params.welcome) === "1";
  const nickname = first(params.nickname) ?? "";
  const t = (await getSite()).loginPage;

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-12">
      <div className="panel animate-rise-in p-6 sm:p-8">
        {welcome ? (
          <div className="mb-6 rounded-xl border border-mint/40 bg-mint/10 px-4 py-3 text-sm text-mint">
            {t.created}
            <SignupTracker />
          </div>
        ) : next ? (
          <div className="mb-6 rounded-xl border border-line bg-surface-2/60 px-4 py-3 text-sm text-ink-200">
            {t.needLogin}
          </div>
        ) : null}

        <h1 className="font-display text-2xl font-bold">{t.title}</h1>
        <p className="mb-6 mt-1 text-sm text-muted">{t.note}</p>
        <LoginForm next={next} initialNickname={nickname} />
      </div>
    </main>
  );
}
