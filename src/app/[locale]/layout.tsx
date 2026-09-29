import type { Metadata } from "next";
import { Geist, Geist_Mono, Unbounded } from "next/font/google";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Analytics } from "@/components/analytics/Analytics";
import { ConsentBanner, ConsentLink } from "@/components/analytics/ConsentBanner";
import { SiteHeader } from "@/components/SiteHeader";
import { DEFAULT_LOCALE, LOCALES, LOCALE_TAGS, isLocale } from "@/i18n/config";
import { LocaleProvider } from "@/i18n/client";
import { currentLocale, getSite } from "@/i18n/server";
import { getCurrentUser } from "@/lib/auth";
import "../globals.css";

// latin-ext carries ğ, ş, ı, İ and the German umlauts.
const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin", "latin-ext"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin", "latin-ext"] });
const unbounded = Unbounded({ variable: "--font-unbounded", subsets: ["latin", "latin-ext"] });

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

/** Absolute URLs are required in link previews; relative ones are ignored. */
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://main.dov186xw29c2h.amplifyapp.com";

export async function generateMetadata({ params }: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  const site = await getSite();
  const title = "Music Fight";

  return {
    metadataBase: new URL(SITE_URL),
    title: { default: title, template: "%s · Music Fight" },
    description: site.meta.tagline,
    alternates: {
      canonical: `/${locale}`,
      languages: Object.fromEntries(LOCALES.map((code) => [LOCALE_TAGS[code], `/${code}`])),
    },
    openGraph: {
      type: "website",
      siteName: title,
      title,
      description: site.meta.tagline,
      url: `/${locale}`,
      locale: LOCALE_TAGS[isLocale(locale) ? locale : DEFAULT_LOCALE].replace("-", "_"),
    },
    twitter: { card: "summary_large_image", title, description: site.meta.tagline },
  };
}

export default async function RootLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const [site, user] = await Promise.all([getSite(), getCurrentUser()]);

  return (
    <html
      lang={await currentLocale()}
      className={`${geistSans.variable} ${geistMono.variable} ${unbounded.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <LocaleProvider locale={locale}>
          <SiteHeader />
          <div className="flex flex-1 flex-col">{children}</div>
          <footer className="border-t border-line/60 px-4 py-6 text-center text-xs text-muted">
            <span>© {new Date().getFullYear()} Music Fight</span>
            <span className="mx-2">·</span>
            <Link href={`/${locale}/help`} className="hover:text-foreground">
              {site.footer.help}
            </Link>
            <span className="mx-2">·</span>
            <Link href={`/${locale}/contact`} className="hover:text-foreground">
              {site.footer.contact}
            </Link>
            <span className="mx-2">·</span>
            <ConsentLink label={site.footer.cookies} />
          </footer>
          <Analytics userId={user?.id ?? null} locale={locale} />
          <ConsentBanner />
        </LocaleProvider>
      </body>
    </html>
  );
}
