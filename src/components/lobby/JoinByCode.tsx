"use client";

import { track } from "@/lib/analytics";
import { useState } from "react";
import { useUi } from "@/i18n/client";
import { useLocaleRouter } from "@/i18n/link";

const CODE_LENGTH = 5;

export function JoinByCode() {
  const router = useLocaleRouter();
  const [code, setCode] = useState("");
  const t = useUi().joinByCode;

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (code.length === CODE_LENGTH) {
          track("match_join_opened");
          router.push(`/room/${code}`);
        }
      }}
      className="panel flex flex-col gap-3 p-5 sm:flex-row sm:items-end"
    >
      <div className="flex-1">
        <label htmlFor="room-code" className="eyebrow">
          {t.label}
        </label>
        <p className="mt-1 text-xs text-muted">{t.hint}</p>
        <input
          id="room-code"
          value={code}
          onChange={(event) =>
            setCode(event.target.value.replace(/[^a-z0-9]/gi, "").toUpperCase().slice(0, CODE_LENGTH))
          }
          placeholder="K7X2M"
          autoComplete="off"
          className="field mt-2 font-mono text-lg tracking-[0.5em]"
        />
      </div>
      <button type="submit" disabled={code.length !== CODE_LENGTH} className="btn btn-ghost py-3">
        {t.submit}
      </button>
    </form>
  );
}
