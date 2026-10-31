import { expect } from "chai";
import { parseOffsets, parseDateInZone, buildReminderTimes } from "../src/helpers/reminderTime";
import remind from "../src/commands/reminder";
import store from "../src/helpers/reminderStore.js";

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
const NOW = Date.UTC(2026, 10, 1, 12, 0); // 2026-11-01 12:00 UTC

describe("reminder times", () => {
  it("reads a before list largest first", () => {
    const offsets = parseOffsets("30m, 1d,2h");
    expect(offsets.map((o) => o.ms)).to.deep.equal([DAY, 2 * HOUR, 30 * 60 * 1000]);
    expect(offsets[0].label).to.equal("1 day");
  });

  it("rejects a bad before entry", () => {
    expect(() => parseOffsets("1d, soon")).to.throw("soon");
    expect(() => parseOffsets("1m,2m,3m,4m,5m,6m")).to.throw("at most");
  });

  it("reads a Pacific date in daylight time and standard time", () => {
    // PDT is UTC-7, PST is UTC-8.
    expect(parseDateInZone("2026-10-30 14:30")).to.equal(Date.UTC(2026, 9, 30, 21, 30));
    expect(parseDateInZone("2026-11-05 09:00")).to.equal(Date.UTC(2026, 10, 5, 17, 0));
  });

  it("rejects badly formed or impossible dates", () => {
    expect(() => parseDateInZone("11/05/2026 9am")).to.throw("YYYY-MM-DD");
    expect(() => parseDateInZone("2026-02-30 10:00")).to.throw("not a real date");
    expect(() => parseDateInZone("2026-11-05 14:60")).to.throw("not a real date");
  });

  it("rejects a time skipped by spring forward, keeps the first fall-back hour", () => {
    expect(() => parseDateInZone("2027-03-14 02:30")).to.throw("spring forward");
    expect(parseDateInZone("2026-11-01 01:30")).to.equal(Date.UTC(2026, 10, 1, 8, 30));
  });

  it("drops repeated before times and caps their size", () => {
    expect(parseOffsets("1d, 24h, 1d")).to.have.length(1);
    expect(() => parseOffsets("99999d")).to.throw("not a time");
  });

  it("rejects times too far ahead instead of overflowing", () => {
    expect(() => buildReminderTimes({ amount: 200000000, unit: "day", now: NOW })).to.throw("5 years");
  });

  it("schedules a time from now plus each before time", () => {
    const plan = buildReminderTimes({ amount: 2, unit: "day", before: "1d, 1h", now: NOW });
    expect(plan.eventTime).to.equal(NOW + 2 * DAY);
    expect(plan.times.map((t) => t.time)).to.deep.equal([NOW + DAY, NOW + 2 * DAY - HOUR, NOW + 2 * DAY]);
    expect(plan.times.at(-1).label).to.equal("at the event");
  });

  it("skips before times that have already passed", () => {
    const plan = buildReminderTimes({ amount: 2, unit: "hour", before: "1d, 1h", now: NOW });
    expect(plan.skipped).to.deep.equal(["1 day"]);
    expect(plan.times).to.have.length(2);
  });

  it("needs exactly one of a date or an amount and unit", () => {
    expect(() => buildReminderTimes({ now: NOW })).to.throw("Give a date");
    expect(() => buildReminderTimes({ amount: 1, unit: "day", date: "2026-11-05 09:00", now: NOW })).to.throw("not both");
    expect(() => buildReminderTimes({ amount: 1, now: NOW })).to.throw("both an amount and a unit");
    expect(() => buildReminderTimes({ date: "2020-01-01 09:00", now: NOW })).to.throw("already passed");
  });
});

describe("/reminder", () => {
  const fakeInteraction = (userId, values) => {
    const replies = [];
    const get = (name) => (values[name] === undefined ? null : values[name]);
    return {
      replies,
      user: { id: userId },
      options: { getString: get, getInteger: get },
      reply: async (message) => replies.push(message),
    };
  };

  it("saves one reminder per time and lists them", async () => {
    const interaction = fakeInteraction("remind-test", { message: "Exam", amount: 3, unit: "day", before: "1d, 2h" });
    await remind.execute(interaction);

    const saved = store.getUpcomingReminders("remind-test");
    expect(saved.map((r) => r.message)).to.deep.equal(["Exam (1 day before)", "Exam (2 hours before)", "Exam"]);
    expect(interaction.replies[0].content).to.include("I'll DM you");
  });

  it("explains a bad input and saves nothing", async () => {
    const interaction = fakeInteraction("remind-bad", { message: "Exam", date: "tomorrow" });
    await remind.execute(interaction);

    expect(store.getUpcomingReminders("remind-bad")).to.have.length(0);
    expect(interaction.replies[0].content).to.include("YYYY-MM-DD");
  });
});
