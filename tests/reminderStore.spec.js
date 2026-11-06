
import { strict as assert } from "node:assert";
import store from "../src/helpers/reminderStore.js";

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

  it("marks a reminder done for its owner and moves it to history", function () {
    const userId = "done-test";
    const reminder = store.addReminder(
      userId,
      "Finish architecture guide",
      Date.now() + 60000,
      "daily"
    );
    const scheduledTime = reminder.nextRun;

    assert.equal(store.markReminderDone("another-user", reminder.id), false);
    assert.equal(reminder.nextRun, scheduledTime);

    assert.equal(store.markReminderDone(userId, reminder.id), true);
    assert.equal(reminder.nextRun, null);
    assert.ok(reminder.completedAt);

    assert.equal(store.getUpcomingReminders(userId).length, 0);
    assert.deepEqual(store.getPastReminders(userId), [
      {
        message: "Finish architecture guide",
        time: reminder.completedAt,
        status: "done",
      },
    ]);
  });