export const TIMEZONE = "Asia/Kathmandu";
export const TZ_OFFSET = "+05:45";
export const SLOT_STEP = 15;
export const LAST_START_BUFFER = 90;

export function kathmanduDateTime(dateStr: string, minutes: number) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const hh = String(hours).padStart(2, "0");
  const mm = String(mins).padStart(2, "0");
  return new Date(`${dateStr}T${hh}:${mm}:00${TZ_OFFSET}`);
}

export function todayISODate() {
  return kathmanduISODate(new Date());
}

export function kathmanduISODate(date: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function kathmanduHM(date: Date) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const hour = parts.find((part) => part.type === "hour")?.value || "00";
  const minute = parts.find((part) => part.type === "minute")?.value || "00";
  return `${hour.padStart(2, "0")}:${minute.padStart(2, "0")}`;
}

export function parseKathmanduDateTime(date: string, time: string) {
  if (!date || !time) return null;
  const value = new Date(`${date}T${time}:00${TZ_OFFSET}`);
  return Number.isNaN(value.getTime()) ? null : value;
}

export function datetimeLocalValue(date: Date) {
  return `${kathmanduISODate(date)}T${kathmanduHM(date)}`;
}

export function parseDatetimeLocal(value: string) {
  if (!value) return null;
  const normalized = value.length === 16 ? `${value}:00` : value;
  const parsed = new Date(`${normalized}${TZ_OFFSET}`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function timeToMinutes(value: string) {
  if (value.includes(":")) {
    const [hours, minutes] = value.split(":").map(Number);
    return hours * 60 + minutes;
  }
  return Number(value || 0);
}

export function minutesToTime(mins: number) {
  const hours = String(Math.floor(mins / 60)).padStart(2, "0");
  const minutes = String(mins % 60).padStart(2, "0");
  return `${hours}:${minutes}`;
}

export function weekdayInKathmandu(dateStr: string) {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
}

export function formatMoney(npr: number) {
  if (npr <= 0) return "ask the desk";
  return `Rs. ${npr.toLocaleString("en-NP")}`;
}

export function formatFromPrice(npr: number) {
  if (npr <= 0) return "ask the desk";
  return `From Rs. ${npr.toLocaleString("en-NP")}`;
}

export function formatTime(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: TIMEZONE,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: TIMEZONE,
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
