import type { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";
import { getSite } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getSite()).contactPage.title };
}

export default async function ContactPage() {
  const t = (await getSite()).contactPage;

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-12">
      <h1 className="font-display text-3xl font-black sm:text-4xl">{t.title}</h1>
      <p className="mt-2 text-sm text-ink-300">{t.intro}</p>

      <div className="mt-8">
        {/* Picked apart on purpose: the dictionary holds functions, and those
            cannot cross into a Client Component. */}
        <ContactForm
          t={{
            nameLabel: t.nameLabel,
            emailLabel: t.emailLabel,
            emailHint: t.emailHint,
            subjectLabel: t.subjectLabel,
            messageLabel: t.messageLabel,
            submit: t.submit,
            sending: t.sending,
            successTitle: t.successTitle,
            successBody: t.successBody,
            another: t.another,
          }}
        />
      </div>
    </main>
  );
}
