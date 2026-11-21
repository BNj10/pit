// School time is Asia/Manila (UTC+08:00) and must not depend on the user's device.

/**
 * Milliseconds for a school-time value: a day ("YYYY-MM-DD", meaning 00:00 that
 * day) or a date-time ("YYYY-MM-DDTHH:mm"). NaN when the value is incomplete.
 */
export function schoolTimestamp(value: string) {
  const dateTime = /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00` : value;
  return new Date(`${dateTime}+08:00`).getTime();
}

const schoolDayParts = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Manila",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** Today in school time as "YYYY-MM-DD". */
export function currentSchoolDay(now: number) {
  const parts = Object.fromEntries(
    schoolDayParts.formatToParts(now).map((part) => [part.type, part.value]),
  );
  return `${parts.year}-${parts.month}-${parts.day}`;
}

const schoolDayFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Manila",
  day: "2-digit",
  month: "short",
  year: "numeric",
});

/** A school-time day or date-time as a day, e.g. "21 Nov 2026"; "—" when incomplete. */
export function formatSchoolDay(value: string) {
  const timestamp = schoolTimestamp(value);
  return Number.isFinite(timestamp) ? schoolDayFormatter.format(timestamp) : "—";
}

const schoolDateTimeFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Manila",
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});

/** A school-time date-time, e.g. "03 Aug 2026, 8:00 am"; "—" when incomplete. */
export function formatSchoolDateTime(value: string) {
  const timestamp = schoolTimestamp(value);
  return Number.isFinite(timestamp) ? schoolDateTimeFormatter.format(timestamp) : "—";
}
