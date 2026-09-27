"use client";

import { useActionState } from "react";
import { login } from "@/app/actions/auth";
import { useUi } from "@/i18n/client";
import { Link } from "@/i18n/link";
import { FormField } from "./FormField";

interface LoginFormProps {
  next: string | null;
  initialNickname: string;
}

export function LoginForm({ next, initialNickname }: LoginFormProps) {
  const [state, action, pending] = useActionState(login, { error: null, nickname: initialNickname });
  const t = useUi().login;

  return (
    <form action={action} className="space-y-4">
      {next && <input type="hidden" name="next" value={next} />}

      <FormField label={t.nickname} name="nickname" autoComplete="username" defaultValue={state.nickname} />
      <FormField label={t.password} name="password" type="password" autoComplete="current-password" />

      {state.error && (
        <p role="alert" className="rounded-xl border border-blaze/40 bg-blaze/10 px-3 py-2 text-sm text-blaze">
          {state.error}
        </p>
      )}

      <button type="submit" disabled={pending} className="btn btn-primary w-full py-3.5 text-base">
        {pending ? t.submitting : t.submit}
      </button>

      <p className="text-center text-sm text-muted">
        {t.noAccount}{" "}
        <Link href="/signup" className="font-semibold text-foreground hover:underline">
          {t.signupLink}
        </Link>
      </p>
    </form>
  );
}
