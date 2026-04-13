/** YYYY-MM-DD for `date` interpreted in `timeZone` (IANA), e.g. America/Los_Angeles */
export function calendarDayInTimeZone(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/** Local hour 0–23 in `timeZone` for `date` */
export function hourInTimeZone(date: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const h = parts.find((p) => p.type === "hour")?.value;
  return Math.min(23, Math.max(0, parseInt(h ?? "0", 10)));
}

export function isWithinSendWindow(
  date: Date,
  timeZone: string,
  startHour: number,
  endHour: number
): boolean {
  const h = hourInTimeZone(date, timeZone);
  return h >= startHour && h <= endHour;
}
