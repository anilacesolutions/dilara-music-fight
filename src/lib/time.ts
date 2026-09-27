/**
 * Calendar maths in Istanbul time. Türkiye has been on permanent UTC+3 since
 * 2016, so a fixed offset is exact and day arithmetic in milliseconds is safe.
 */
const ISTANBUL_OFFSET = "+03:00";
const DAY_MS = 86_400_000;
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function istanbulParts(now: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Istanbul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  }).formatToParts(now);

  const pick = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return { year: pick("year"), month: pick("month"), day: pick("day"), weekday: pick("weekday") };
}

export type LeaderboardPeriod = "daily" | "weekly" | "monthly";

/** Start of the current day, Monday-based week, or month in Istanbul. */
export function periodStart(period: LeaderboardPeriod, now = new Date()): Date {
  const { year, month, day, weekday } = istanbulParts(now);

  if (period === "monthly") {
    return new Date(`${year}-${month}-01T00:00:00${ISTANBUL_OFFSET}`);
  }

  const midnight = new Date(`${year}-${month}-${day}T00:00:00${ISTANBUL_OFFSET}`);
  if (period === "daily") return midnight;

  return new Date(midnight.getTime() - WEEKDAYS.indexOf(weekday) * DAY_MS);
}

/**
 * A YYYY-MM-DD calendar date (a birthday, say) as UTC midnight, or null when the
 * date doesn't exist. Deliberately not tied to Istanbul: +03:00 only holds since
 * 2016, and before that winter dates would slide back a day.
 */
export function parseCalendarDate(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00Z`);
  // Rejects rollovers like 2001-02-30 that JavaScript silently turns into March.
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value ? date : null;
}

/** Full years between a YYYY-MM-DD birth date and today in Istanbul. */
export function ageInYears(birthDate: string, now = new Date()): number {
  const { year, month, day } = istanbulParts(now);
  const [birthYear, birthMonth, birthDay] = birthDate.split("-").map(Number);

  let age = Number(year) - birthYear;
  const hadBirthdayThisYear =
    Number(month) > birthMonth || (Number(month) === birthMonth && Number(day) >= birthDay);
  if (!hadBirthdayThisYear) age -= 1;
  return age;
}
