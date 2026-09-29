import { getSite } from "@/i18n/server";
import type { CurrentUser } from "@/lib/auth";
import { WARNINGS_BEFORE_RESTRICTION } from "@/lib/rules";

/**
 * What the account itself says about a chat violation. The chat tells you once,
 * in the moment; this is where it still says so tomorrow.
 */
export async function AccountNotice({ user }: { user: CurrentUser }) {
  if (!user.restricted && user.warnings === 0) return null;
  const t = (await getSite()).accountNotice;

  const restricted = user.restricted;
  const tone = restricted
    ? "border-blaze/45 bg-blaze/10 text-blaze"
    : "border-sun/40 bg-sun/10 text-sun";

  return (
    <div className={`mb-6 rounded-2xl border px-4 py-3.5 text-sm ${tone}`} role="status">
      <p className="font-semibold">
        {restricted ? t.restrictedTitle : t.warningTitle(user.warnings, WARNINGS_BEFORE_RESTRICTION)}
      </p>
      <p className="mt-1 text-xs leading-relaxed opacity-90">
        {restricted ? t.restrictedBody : t.warningBody(WARNINGS_BEFORE_RESTRICTION)}
      </p>
    </div>
  );
}
