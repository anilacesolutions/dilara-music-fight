import type { Metadata } from "next";
import { getSite } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getSite()).meta.kvkk };
}

export default async function KvkkPage() {
  const t = (await getSite()).kvkk;

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12">
      <div className="mb-8 rounded-xl border border-sun/40 bg-sun/10 px-4 py-3 text-sm text-sun">
        <strong>{t.draftLabel}</strong> {t.draftBody}
      </div>

      <h1 className="font-display text-3xl font-black">{t.title}</h1>

      <div className="mt-8 space-y-8 text-sm leading-relaxed text-ink-200">
        <section>
          <h2 className="mb-2 font-display text-lg font-bold text-foreground">{t.controllerTitle}</h2>
          <p>{t.controllerBody}</p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-lg font-bold text-foreground">{t.dataTitle}</h2>
          <ul className="list-disc space-y-1 pl-5">
            {t.data.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="mb-2 font-display text-lg font-bold text-foreground">{t.purposeTitle}</h2>
          <p>{t.purposeBody}</p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-lg font-bold text-foreground">{t.rightsTitle}</h2>
          <p>{t.rightsBody}</p>
        </section>
      </div>
    </main>
  );
}
