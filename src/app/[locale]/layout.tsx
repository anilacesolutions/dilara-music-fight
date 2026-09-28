import type { Metadata } from "next";
import { Geist, Geist_Mono, Unbounded } from "next/font/google";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { LOCALES, isLocale } from "@/i18n/config";
import { LocaleProvider } from "@/i18n/client";
import { currentLocale, getSite } from "@/i18n/server";
import "../globals.css";

// latin-ext carries ğ, ş, ı, İ and the German umlauts.
const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin", "latin-ext"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin", "latin-ext"] });
const unbounded = Unbounded({ variable: "--font-unbounded", subsets: ["latin", "latin-ext"] });

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSite();
  return {
    title: { default: "Music Fight", template: "%s · Music Fight" },
    description: site.meta.tagline,
  };
}

export default async function RootLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const site = await getSite();

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
            <Link href={`/${locale}/kvkk`} className="hover:text-foreground">
              {site.footer.privacy}
            </Link>
          </footer>
        </LocaleProvider>
      </body>
    </html>
  );
}
