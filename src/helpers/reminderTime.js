// Time math for /reminder: when the event is, and when to send each reminder.

const UNIT_MS = {
  second: 1000,
  minute: 60 * 1000,
  hour: 60 * 60 * 1000,
  day: 24 * 60 * 60 * 1000,
};

// Short letters accepted in the "before" list, e.g. "1d, 2h, 30m".
const SHORT_UNITS = { s: "second", m: "minute", h: "hour", d: "day" };

export const MAX_OFFSETS = 5;
export const DEFAULT_TIME_ZONE = "America/Los_Angeles";
const MAX_AHEAD_MS = 5 * 366 * UNIT_MS.day;

export function durationMs(amount, unit) {
  if (!UNIT_MS[unit]) throw new Error(`Unknown unit: ${unit}`);
  return amount * UNIT_MS[unit];
}

// Reads a list like "1d, 2h, 30m" into [{ ms, label }], largest first.
export function parseOffsets(text) {
  if (!text || !text.trim()) return [];

  const parts = text.split(",").map((part) => part.trim()).filter(Boolean);
  if (parts.length > MAX_OFFSETS) {
    throw new Error(`Use at most ${MAX_OFFSETS} times in "before".`);
  }

  const offsets = parts.map((part) => {
    const match = /^(\d{1,4})\s*([smhd])$/i.exec(part);
    if (!match || Number(match[1]) < 1) {
      throw new Error(`"${part}" is not a time like 30m, 2h or 1d.`);
    }
    const amount = Number(match[1]);
    const unit = SHORT_UNITS[match[2].toLowerCase()];
    return {
      ms: durationMs(amount, unit),
      label: `${amount} ${unit}${amount === 1 ? "" : "s"}`,
    };
  });

  // "1d, 24h" mean the same time, so keep only one of them.
  const unique = offsets.filter((offset, i) => offsets.findIndex((o) => o.ms === offset.ms) === i);
  return unique.sort((a, b) => b.ms - a.ms);
}

// How far the time zone is ahead of UTC at a given instant, in ms.
function zoneOffsetMs(instant, timeZone) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(new Date(instant));
  const get = (type) => Number(parts.find((p) => p.type === type).value);
  const asUtc = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second"));
  return asUtc - instant;
}

// Reads "YYYY-MM-DD HH:MM" as a wall-clock time in the given zone.
export function parseDateInZone(text, timeZone = DEFAULT_TIME_ZONE) {
  const match = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{1,2}):(\d{2})$/.exec((text || "").trim());
  if (!match) {
    throw new Error('Write the date as "YYYY-MM-DD HH:MM", for example 2026-11-05 14:30.');
  }

  const [year, month, day, hour, minute] = match.slice(1).map(Number);
  const wallClock = Date.UTC(year, month - 1, day, hour, minute);

  // Rejects dates like 2026-02-30 that Date.UTC would quietly roll over.
  const check = new Date(wallClock);
  if (check.getUTCMonth() !== month - 1 || check.getUTCDate() !== day || hour > 23 || minute > 59) {
    throw new Error(`"${text}" is not a real date and time.`);
  }

  // Guess with the offset at the wall-clock time, then correct once for DST.
  let instant = wallClock - zoneOffsetMs(wallClock, timeZone);
  instant = wallClock - zoneOffsetMs(instant, timeZone);

  // Times skipped when clocks spring forward (e.g. 2:30 AM) never happen.
  if (instant + zoneOffsetMs(instant, timeZone) !== wallClock) {
    throw new Error(`${text} doesn't exist because clocks spring forward then. Pick another time.`);
  }
  return instant;
}

// Works out the event time and every reminder time from the command options.
export function buildReminderTimes({ amount, unit, date, before, now = Date.now(), timeZone = DEFAULT_TIME_ZONE }) {
  const hasDuration = amount != null || unit != null;
  if (hasDuration && date) throw new Error("Pick either a date or an amount and unit, not both.");
  if (!hasDuration && !date) throw new Error("Give a date, or an amount and unit.");
  if (hasDuration && (amount == null || unit == null)) throw new Error("Give both an amount and a unit.");

  const eventTime = date ? parseDateInZone(date, timeZone) : now + durationMs(amount, unit);
  if (eventTime <= now) throw new Error("That time has already passed.");
  if (eventTime > now + MAX_AHEAD_MS) throw new Error("Pick a time within the next 5 years.");

  const times = [];
  const skipped = [];
  for (const offset of parseOffsets(before)) {
    const time = eventTime - offset.ms;
    if (time <= now) skipped.push(offset.label);
    else times.push({ time, label: `${offset.label} before` });
  }
  times.push({ time: eventTime, label: "at the event" });

  return { eventTime, times, skipped };
}
