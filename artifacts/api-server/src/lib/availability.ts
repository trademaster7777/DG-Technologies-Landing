/**
 * Owner-configurable call availability.
 *
 * The schedule comes from the CALL_AVAILABILITY env var so it can change
 * without code edits. Format: semicolon-separated rules, each of
 *   <Days> <start>-<end>
 * where <Days> is a day name (Mon..Sun), a range (Mon-Fri), or a comma list
 * (Mon,Wed,Fri), and hours are 24h HH:MM. The end hour is exclusive; slots
 * are offered on the hour. Example:
 *   CALL_AVAILABILITY="Mon-Fri 09:00-17:00; Sat 10:00-13:00"
 * offers 09:00..16:00 on weekdays and 10:00..12:00 on Saturday.
 *
 * When unset, defaults to every day 09:00-17:00 (the previous hardcoded
 * behavior). Invalid config throws at startup — a silently-wrong schedule
 * would be worse than a crash.
 */

const DAY_NAMES = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;

const DEFAULT_SCHEDULE = "Mon-Sun 09:00-17:00";

export interface DaySlots {
  dayOfWeek: number; // 0 = Sunday ... 6 = Saturday
  slots: string[]; // "HH:MM" start times, sorted ascending
}

function dayIndex(name: string): number {
  const idx = DAY_NAMES.indexOf(
    name.trim().slice(0, 3).toLowerCase() as (typeof DAY_NAMES)[number],
  );
  if (idx === -1) {
    throw new Error(`CALL_AVAILABILITY: unknown day name "${name}"`);
  }
  return idx;
}

function parseHour(value: string, rule: string): number {
  const m = /^([01]\d|2[0-3]):00$/.exec(value.trim());
  if (!m) {
    throw new Error(
      `CALL_AVAILABILITY: invalid time "${value}" in rule "${rule}" (use HH:00, 24h clock)`,
    );
  }
  return Number(m[1]);
}

function expandDays(spec: string): number[] {
  const days = new Set<number>();
  for (const part of spec.split(",")) {
    const range = part.split("-");
    if (range.length === 2) {
      const start = dayIndex(range[0]!);
      const end = dayIndex(range[1]!);
      // Walk forward, wrapping (e.g. Fri-Mon = Fri,Sat,Sun,Mon)
      for (let d = start; ; d = (d + 1) % 7) {
        days.add(d);
        if (d === end) break;
      }
    } else {
      days.add(dayIndex(part));
    }
  }
  return [...days];
}

export function parseAvailability(config: string): DaySlots[] {
  const hoursByDay = new Map<number, Set<number>>();
  const rules = config
    .split(";")
    .map((r) => r.trim())
    .filter(Boolean);
  if (rules.length === 0) {
    throw new Error("CALL_AVAILABILITY: no rules found");
  }
  for (const rule of rules) {
    const m = /^(.+?)\s+(\d{2}:\d{2})-(\d{2}:\d{2})$/.exec(rule);
    if (!m) {
      throw new Error(
        `CALL_AVAILABILITY: invalid rule "${rule}" (expected e.g. "Mon-Fri 09:00-17:00")`,
      );
    }
    const start = parseHour(m[2]!, rule);
    const end = parseHour(m[3]!, rule);
    if (end <= start) {
      throw new Error(
        `CALL_AVAILABILITY: end must be after start in rule "${rule}"`,
      );
    }
    for (const day of expandDays(m[1]!)) {
      const hours = hoursByDay.get(day) ?? new Set<number>();
      for (let h = start; h < end; h++) hours.add(h);
      hoursByDay.set(day, hours);
    }
  }
  const days: DaySlots[] = [];
  for (let d = 0; d < 7; d++) {
    const hours = hoursByDay.get(d);
    days.push({
      dayOfWeek: d,
      slots: hours
        ? [...hours]
            .sort((a, b) => a - b)
            .map((h) => `${String(h).padStart(2, "0")}:00`)
        : [],
    });
  }
  return days;
}

// Parsed once at startup so a bad config fails fast and loudly.
const schedule: DaySlots[] = parseAvailability(
  process.env.CALL_AVAILABILITY?.trim() || DEFAULT_SCHEDULE,
);

export function getAvailability(): DaySlots[] {
  return schedule;
}

/** Day of week (0-6) for a YYYY-MM-DD date string, in local time. */
export function dayOfWeekOf(dateStr: string): number {
  const [y, mo, da] = dateStr.split("-").map(Number);
  return new Date(y!, mo! - 1, da!).getDay();
}

export function isSlotAvailable(dateStr: string, slot: string): boolean {
  const day = schedule[dayOfWeekOf(dateStr)];
  return !!day && day.slots.includes(slot);
}
