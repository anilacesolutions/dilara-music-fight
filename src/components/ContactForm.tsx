"use client";

import { useActionState } from "react";
import { sendContactMessage } from "@/app/actions/contact";
import { initialContactState } from "@/lib/form-state";

interface ContactCopy {
  nameLabel: string;
  emailLabel: string;
  emailHint: string;
  subjectLabel: string;
  messageLabel: string;
  submit: string;
  sending: string;
  successTitle: string;
  successBody: string;
  another: string;
}

/**
 * The copy is passed in rather than read from a hook: this form is the only
 * client component on the page, and the dictionary it needs lives in the
 * server-side one.
 */
export function ContactForm({ t }: { t: ContactCopy }) {
  const [state, action, pending] = useActionState(sendContactMessage, initialContactState);
  const { errors, values } = state;

  if (state.status === "sent") {
    return (
      <div className="panel animate-rise-in p-6 text-center">
        <p className="font-display text-xl font-black text-mint">{t.successTitle}</p>
        <p className="mt-2 text-sm text-ink-200">{t.successBody}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="btn btn-ghost mt-5"
        >
          {t.another}
        </button>
      </div>
    );
  }

  return (
    <form action={action} className="panel space-y-4 p-5 sm:p-6" noValidate>
      <Field label={t.nameLabel} name="name" defaultValue={values.name} error={errors.name} autoComplete="name" />
      <Field
        label={t.emailLabel}
        name="email"
        type="email"
        defaultValue={values.email}
        error={errors.email}
        hint={t.emailHint}
        autoComplete="email"
      />
      <Field label={t.subjectLabel} name="subject" defaultValue={values.subject} error={errors.subject} />

      <div>
        <label htmlFor="contact-message" className="mb-1.5 block text-xs font-semibold text-ink-200">
          {t.messageLabel}
        </label>
        <textarea
          id="contact-message"
          name="message"
          rows={6}
          defaultValue={values.message}
          aria-invalid={errors.message ? true : undefined}
          className="field resize-y"
        />
        {errors.message && <p className="mt-1.5 text-xs text-blaze">{errors.message}</p>}
      </div>

      {errors.form && (
        <p role="alert" className="rounded-xl border border-blaze/40 bg-blaze/10 px-3 py-2 text-sm text-blaze">
          {errors.form}
        </p>
      )}

      <button type="submit" disabled={pending} className="btn btn-primary w-full py-3.5 text-base">
        {pending ? t.sending : t.submit}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  error,
  hint,
  ...input
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string; name: string; error?: string; hint?: string }) {
  const id = `contact-${name}`;
  const note = error ?? hint;

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs font-semibold text-ink-200">
        {label}
      </label>
      <input id={id} name={name} className="field" aria-invalid={error ? true : undefined} {...input} />
      {note && <p className={`mt-1.5 text-xs ${error ? "text-blaze" : "text-muted"}`}>{note}</p>}
    </div>
  );
}
