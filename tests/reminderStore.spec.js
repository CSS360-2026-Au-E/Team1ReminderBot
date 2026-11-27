
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


describe("Reminder statistics", function () {
  it("counts pending and completed reminders for each user", function () {
    const userId = "stats-test-user";
    const otherUser = "stats-other-user";

    const pending = store.addReminder(
      userId,
      "Pending task",
      Date.now() + 60000
    );

    const completed = store.addReminder(
      userId,
      "Completed task",
      Date.now() + 60000
    );

    store.addReminder(
      otherUser,
      "Someone else's task",
      Date.now() + 60000
    );

    store.markReminderDone(userId, completed.id);

    assert.deepEqual(store.getReminderStats(userId), {
      pending: 1,
      completed: 1
    });

    assert.deepEqual(store.getReminderStats(otherUser), {
      pending: 1,
      completed: 0
    });
  });
});

describe("Reminder search", function () {
  it("finds reminders by keyword for the correct user", function () {
    const userId = "search-test-user";
    const otherUser = "another-search-user";

    store.addReminder(userId, "Finish homework", Date.now() + 60000);
    store.addReminder(userId, "Buy groceries", Date.now() + 60000);
    store.addReminder(otherUser, "Homework for someone else", Date.now() + 60000);

    const results = store.searchReminders(userId, "HOMEWORK");

    assert.equal(results.length, 1);
    assert.equal(results[0].message, "Finish homework");
    assert.equal(store.searchReminders(userId, "missing-word").length, 0);
  });
});

describe("Clear completed reminders", function () {
  it("clears only the user's completed reminders", function () {
    const userId = "clear-test-user";
    const otherUser = "other-clear-user";

    const completed = store.addReminder(
      userId, "Completed task", Date.now() + 60000
    );
    const pending = store.addReminder(
      userId, "Pending task", Date.now() + 60000
    );
    const other = store.addReminder(
      otherUser, "Other task", Date.now() + 60000
    );

    store.markReminderDone(userId, completed.id);
    store.markReminderDone(otherUser, other.id);

    assert.equal(store.clearCompletedReminders(userId), 1);
    assert.ok(store.getAllReminders().includes(pending));
    assert.ok(store.getAllReminders().includes(other));
    assert.ok(!store.getAllReminders().includes(completed));
  });
});
