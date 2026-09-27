import type { Locale } from "../config";
import { ui as de } from "./de";
import { ui as en } from "./en";
import { ui as tr, type Ui } from "./tr";

/** Every language's client strings. Client Components pick one by locale. */
export const UI: Record<Locale, Ui> = { tr, en, de };

export type { Ui };
