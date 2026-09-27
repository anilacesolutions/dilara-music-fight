import { Link } from "@/i18n/link";
import { getSite } from "@/i18n/server";

export default async function NotFound() {
  const t = (await getSite()).notFound;

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center">
      <p className="font-display text-7xl font-black text-gradient">404</p>
      <h1 className="mt-4 font-display text-xl font-bold">{t.title}</h1>
      <p className="mt-2 text-sm text-muted">{t.body}</p>
      <Link href="/" className="btn btn-ghost mt-8">
        {t.home}
      </Link>
    </main>
  );
}
