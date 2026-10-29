
import { strict as assert } from "node:assert";


const store = require("../src/helpers/reminderStore.js");
describe("Reminder history and recurrence", function () {
  it("shows completed reminders in history", function () {
    const userId = "history-test";
    const reminder = store.addReminder(
      userId,
      "Study",
      Date.now() + 60000,
      "none"
    );

    store.markReminderFired(reminder);

    assert.equal(store.getPastReminders(userId).length, 1);
    assert.equal(store.getUpcomingReminders(userId).length, 0);
  });

  it("schedules the next daily reminder", function () {
    const reminder = store.addReminder(
      "daily-test",
      "Homework",
      Date.now() + 60000,
      "daily"
    );

    const firstRun = reminder.nextRun;
    store.markReminderFired(reminder);

    assert.equal(reminder.nextRun - firstRun, 86400000);
  });

  it("schedules the next weekly reminder", function () {
    const reminder = store.addReminder(
      "weekly-test",
      "Meeting",
      Date.now() + 60000,
      "weekly"
    );

    const firstRun = reminder.nextRun;
    store.markReminderFired(reminder);

    assert.equal(reminder.nextRun - firstRun, 604800000);
  });
});
