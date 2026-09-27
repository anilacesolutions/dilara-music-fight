"use client";

import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, type ComponentProps } from "react";
import { useLocale } from "./client";
import type { Locale } from "./config";

/** "/lobby" in German becomes "/de/lobby". External and hash-only links are left alone. */
export function withLocale(href: string, locale: Locale): string {
  if (!href.startsWith("/")) return href;
  return `/${locale}${href === "/" ? "" : href}`;
}

type LinkProps = Omit<ComponentProps<typeof NextLink>, "href"> & { href: string };

/**
 * next/link that keeps the reader in their language. It works inside Server
 * Components too, because the locale comes from the provider in the root layout.
 */
export function Link({ href, ...rest }: LinkProps) {
  return <NextLink href={withLocale(href, useLocale())} {...rest} />;
}

/** For the handful of places that navigate imperatively. */
export function useLocaleRouter() {
  const router = useRouter();
  const locale = useLocale();

  const push = useCallback((href: string) => router.push(withLocale(href, locale)), [router, locale]);
  return { push };
}
