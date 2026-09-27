import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSite } from "@/i18n/server";
import { CoinPreview } from "./CoinPreview";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getSite()).meta.coinPreview };
}

/** Development-only sandbox for the opening sequence. Never served in production. */
export default async function CoinPreviewPage() {
  if (process.env.NODE_ENV === "production") notFound();
  const t = (await getSite()).devCoin;

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
      <p className="eyebrow">{t.eyebrow}</p>
      <h1 className="mt-1 font-display text-2xl font-black sm:text-3xl">{t.title}</h1>
      <p className="mt-2 text-sm text-ink-300">{t.body}</p>

      <div className="mt-8">
        <CoinPreview />
      </div>
    </main>
  );
}
