import { ImageResponse } from "next/og";
import { isLocale } from "@/i18n/config";
import { SITE } from "@/i18n/site";

/**
 * The card people see when a link to the site is pasted into a chat. Drawn
 * here rather than shipped as a file so the tagline follows the language of
 * the link that was shared.
 */
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Music Fight";

const INK = "#0d0b14";
const FLARE = "#ff3d7f";
const PULSE = "#22d3ee";
const VOLT = "#8b5cf6";

export default async function OpengraphImage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const site = SITE[isLocale(locale) ? locale : "tr"];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          background: `radial-gradient(900px 500px at 15% 0%, rgba(255,61,127,0.28), transparent 60%), radial-gradient(900px 500px at 85% 100%, rgba(34,211,238,0.24), transparent 60%), ${INK}`,
          padding: "72px 80px",
          fontFamily: "sans-serif",
        }}
      >
        {/* The equaliser mark, drawn as plain boxes so no SVG parsing is needed. */}
        <div style={{ display: "flex", alignItems: "flex-end", gap: 14, height: 96 }}>
          <div style={{ width: 26, height: 56, borderRadius: 13, background: FLARE }} />
          <div style={{ width: 26, height: 96, borderRadius: 13, background: VOLT }} />
          <div style={{ width: 26, height: 38, borderRadius: 13, background: PULSE }} />
        </div>

        <div style={{ display: "flex", marginTop: 44, fontSize: 108, fontWeight: 900, letterSpacing: -3 }}>
          <span style={{ color: FLARE }}>MUSIC</span>
          <span style={{ color: PULSE }}>FIGHT</span>
        </div>

        <div style={{ display: "flex", marginTop: 28, maxWidth: 900, fontSize: 38, lineHeight: 1.3, color: "#c9c5d6" }}>
          {site.meta.tagline}
        </div>

        {/* The same three chips the landing page leads with. */}
        <div style={{ display: "flex", marginTop: 48, alignItems: "center", gap: 16, fontSize: 25, color: "#8b8799" }}>
          {site.landing.chips(80).slice(0, 3).map((chip) => (
            <span
              key={chip}
              style={{ display: "flex", padding: "10px 20px", borderRadius: 999, border: "2px solid #2a2635" }}
            >
              {chip}
            </span>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
