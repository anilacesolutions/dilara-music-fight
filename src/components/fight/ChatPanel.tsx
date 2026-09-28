"use client";

import { useEffect, useRef, useState } from "react";
import { useLocaleTag, useUi } from "@/i18n/client";
import { CHAT_MAX_LENGTH, containsLink } from "@/lib/chat-rules";
import type { ChatMessageView } from "@/lib/types";
import { postJson } from "./api";

const QUICK_EMOJI = ["🔥", "😂", "👏", "😱", "🤘", "💀"];

const ROLE_TONE = {
  a: "text-player-a",
  b: "text-player-b",
  spectator: "text-ink-300",
};

interface ChatPanelProps {
  code: string;
  messages: ChatMessageView[];
  /** False once the match is over; the chat is deleted then. */
  open: boolean;
  /** Spectators may be muted by the players; they still read everything. */
  muted: boolean;
  onMessage: (message: ChatMessageView) => void;
  onBlocked: (nickname: string) => void;
}

export function ChatPanel({ code, messages, open, muted, onMessage, onBlocked }: ChatPanelProps) {
  const ui = useUi();
  const t = ui.chat;
  const localeTag = useLocaleTag();
  const listRef = useRef<HTMLOListElement>(null);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [menuFor, setMenuFor] = useState<string | null>(null);

  // Keep the newest message in view.
  useEffect(() => {
    const list = listRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [messages.length]);

  async function send(value: string) {
    const message = value.trim();
    if (!message) return;
    if (containsLink(message)) {
      setError(t.noLinks);
      return;
    }

    setSending(true);
    setError(null);
    try {
      const data = await postJson<{ message: ChatMessageView }>(`/api/rooms/${code}/chat`, { text: message });
      onMessage(data.message);
      if (message === value.trim()) setText("");
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : t.sendFailed);
    } finally {
      setSending(false);
    }
  }

  async function report(message: ChatMessageView) {
    setMenuFor(null);
    try {
      await postJson(`/api/chat/${message.id}/report`, {});
      setNotice(t.reported(message.nickname));
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : t.reportFailed);
    }
  }

  async function block(message: ChatMessageView) {
    setMenuFor(null);
    try {
      const data = await postJson<{ nickname: string }>(`/api/chat/${message.id}/block`, {});
      onBlocked(data.nickname);
      setNotice(t.blocked(data.nickname));
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : t.blockFailed);
    }
  }

  return (
    <section className="panel flex flex-col p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-sm font-bold">{t.title}</h2>
        <span className="text-[11px] text-muted">{t.who}</span>
      </div>

      <ol ref={listRef} className="h-72 space-y-2 overflow-y-auto pr-1" aria-live="polite">
        {messages.length === 0 ? (
          <li className="py-10 text-center text-sm text-muted">{open ? t.empty : t.closed}</li>
        ) : (
          messages.map((message) => (
            <li key={message.id} className="group relative rounded-lg px-2 py-1.5 hover:bg-surface-2/60">
              <div className="flex items-baseline gap-2 text-[11px]">
                <span className={`font-bold ${ROLE_TONE[message.role]}`}>
                  {message.role === "spectator" && "👀 "}
                  {message.nickname}
                  {message.mine && ` (${ui.common.you})`}
                </span>
                <time className="text-ink-600">
                  {new Date(message.createdAt).toLocaleTimeString(localeTag, { hour: "2-digit", minute: "2-digit" })}
                </time>
              </div>
              <p className="break-words pr-6 text-sm text-ink-100">{message.text}</p>

              {!message.mine && (
                <button
                  type="button"
                  onClick={() => setMenuFor(menuFor === message.id ? null : message.id)}
                  className="absolute right-1 top-1 rounded px-1.5 text-muted opacity-0 transition hover:text-foreground focus:opacity-100 group-hover:opacity-100"
                  aria-label={t.options(message.nickname)}
                >
                  ⋯
                </button>
              )}
              {menuFor === message.id && (
                <div className="absolute right-1 top-7 z-10 flex flex-col overflow-hidden rounded-lg border border-line bg-surface text-xs shadow-xl">
                  <button type="button" onClick={() => void report(message)} className="px-3 py-2 text-left hover:bg-surface-2">
                    {t.report}
                  </button>
                  <button type="button" onClick={() => void block(message)} className="px-3 py-2 text-left hover:bg-surface-2">
                    {t.block}
                  </button>
                </div>
              )}
            </li>
          ))
        )}
      </ol>

      {open && muted && <p className="mt-3 rounded-lg border border-line bg-surface-2/60 px-2.5 py-2 text-[11px] text-muted">{t.mutedSpectator}</p>}

      {open && !muted && (
        <>
          <div className="mt-3 flex gap-1">
            {QUICK_EMOJI.map((emoji) => (
              <button
                key={emoji}
                type="button"
                disabled={sending}
                onClick={() => void send(emoji)}
                className="rounded-lg px-1.5 py-1 text-lg transition hover:scale-110 hover:bg-surface-2 disabled:opacity-40"
                aria-label={t.quickSend(emoji)}
              >
                {emoji}
              </button>
            ))}
          </div>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              void send(text);
            }}
            className="mt-2 flex gap-2"
          >
            <input
              value={text}
              onChange={(event) => setText(event.target.value)}
              maxLength={CHAT_MAX_LENGTH}
              placeholder={t.placeholder}
              aria-label={t.inputLabel}
              className="field py-2"
            />
            <button type="submit" disabled={sending || !text.trim()} className="btn btn-ghost shrink-0 px-3 py-2">
              {t.send}
            </button>
          </form>
        </>
      )}

      {error && <p className="mt-2 text-xs text-blaze">{error}</p>}
      {notice && !error && <p className="mt-2 text-xs text-mint">{notice}</p>}

      <p className="mt-3 rounded-lg border border-sun/30 bg-sun/5 px-2.5 py-2 text-[11px] leading-relaxed text-sun">
        {t.warning}
      </p>
    </section>
  );
}
