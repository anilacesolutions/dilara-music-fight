import type { Locale } from "../config";
import { site as de } from "./de";
import { site as en } from "./en";
import { site as tr, type Site } from "./tr";

export const SITE: Record<Locale, Site> = { tr, en, de };

export type { Site };
