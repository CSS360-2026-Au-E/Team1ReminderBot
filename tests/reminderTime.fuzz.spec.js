import { strict as assert } from "node:assert";
import { buildReminderTimes, parseOffsets } from "../src/helpers/reminderTime.js";

function createRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 0x100000000;
  };
}

function integerBetween(random, min, max) {
  return min + Math.floor(random() * (max - min + 1));
}

describe("reminder time fuzz tests", () => {
  it("keeps generated valid offsets positive, unique, and largest first", () => {
    const random = createRandom(360145);
    const units = ["s", "m", "h", "d"];

    for (let run = 0; run < 500; run += 1) {
      const entries = Array.from(
        { length: integerBetween(random, 1, 5) },
        () => `${integerBetween(random, 1, 999)}${units[integerBetween(random, 0, units.length - 1)]}`
      );
      const offsets = parseOffsets(entries.join(","));
      const times = offsets.map((offset) => offset.ms);

      assert.ok(times.every((time) => Number.isFinite(time) && time > 0));
      assert.equal(new Set(times).size, times.length);
      assert.ok(times.every((time, index) => index === 0 || times[index - 1] > time));
    }
  });

  it("rejects generated malformed offset strings", () => {
    const random = createRandom(20261114);
    const characters = "abcdefghijklmnopqrstuvwxyz0123456789 ,!";

    for (let run = 0; run < 500; run += 1) {
      const suffix = Array.from(
        { length: integerBetween(random, 0, 20) },
        () => characters[integerBetween(random, 0, characters.length - 1)]
      ).join("");

      assert.throws(() => parseOffsets(`!${suffix}`));
    }
  });

  it("keeps generated reminder plans ordered and after the current time", () => {
    const random = createRandom(80210);
    const units = ["second", "minute", "hour", "day"];
    const now = Date.UTC(2026, 0, 1);

    for (let run = 0; run < 500; run += 1) {
      const amount = integerBetween(random, 1, 100);
      const unit = units[integerBetween(random, 0, units.length - 1)];
      const before = Array.from(
        { length: integerBetween(random, 0, 5) },
        () => `${integerBetween(random, 1, 2000)}${["s", "m", "h", "d"][integerBetween(random, 0, 3)]}`
      ).join(",");
      const plan = buildReminderTimes({ amount, unit, before, now });

      assert.equal(plan.times.at(-1).time, plan.eventTime);
      assert.ok(plan.times.every(({ time }) => time > now && time <= plan.eventTime));
      assert.ok(plan.times.every((entry, index) =>
        index === 0 || plan.times[index - 1].time < entry.time
      ));
    }
  });
});
