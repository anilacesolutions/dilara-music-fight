"use server";

import { ObjectId } from "mongodb";
import { z } from "zod";
import { cookieLocale } from "@/i18n/server";
import { SITE } from "@/i18n/site";
import { getCurrentUser } from "@/lib/auth";
import type { ContactState } from "@/lib/form-state";
import { contactMessagesCollection } from "@/lib/mongodb";

/** Long enough for a real report, short enough that nobody pastes a novel. */
const MAX_MESSAGE = 2000;

function text(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

/**
 * Stores the note and nothing else: no mail is sent and no outside service is
 * involved. Messages wait in the database until somebody reads them.
 */
export async function sendContactMessage(_state: ContactState, formData: FormData): Promise<ContactState> {
  const locale = await cookieLocale();
  const t = SITE[locale].contactPage;

  const schema = z.object({
    name: z.string().min(1, { error: t.nameRequired }).max(80, { error: t.nameRequired }),
    email: z.email({ error: t.emailInvalid }),
    subject: z.string().min(1, { error: t.subjectRequired }).max(120, { error: t.subjectRequired }),
    message: z
      .string()
      .min(10, { error: t.messageShort })
      .max(MAX_MESSAGE, { error: t.messageLong(MAX_MESSAGE) }),
  });

  const values = {
    name: text(formData, "name"),
    email: text(formData, "email"),
    subject: text(formData, "subject"),
    message: text(formData, "message"),
  };

  const parsed = schema.safeParse(values);
  if (!parsed.success) {
    const errors: ContactState["errors"] = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0];
      if (typeof field === "string" && !(field in errors)) {
        errors[field as keyof ContactState["errors"]] = issue.message;
      }
    }
    return { status: "idle", errors, values };
  }

  try {
    const user = await getCurrentUser();
    const messages = await contactMessagesCollection();
    await messages.insertOne({
      ...parsed.data,
      userId: user ? new ObjectId(user.id) : null,
      locale,
      createdAt: new Date(),
    });
  } catch (error) {
    console.error("[contact] could not store the message", error);
    return { status: "idle", errors: { form: t.failed }, values };
  }

  return { status: "sent", errors: {}, values: { name: "", email: "", subject: "", message: "" } };
}
