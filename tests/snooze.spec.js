import { strict as assert } from "node:assert";
import store from "../src/helpers/reminderStore.js";

describe("Snooze reminder", function () {
  it("reschedules a fired reminder for 5 minutes", function () {
    const userId = "snooze-test";
    const reminder = store.addReminder(
      userId,
      "Study for exam",
      Date.now() - 1000
    );

    store.markReminderFired(reminder);

    const before = Date.now();
    const result = store.snoozeReminder(userId, reminder.id);

    assert.equal(result, true);
    assert.ok(reminder.nextRun >= before + 300000);
    assert.ok(reminder.nextRun <= Date.now() + 300000);
  });

  it("does not let another user snooze the reminder", function () {
    const reminder = store.addReminder(
      "owner-test",
      "Homework",
      Date.now() + 60000
    );

    assert.equal(
      store.snoozeReminder("another-user", reminder.id),
      false
    );
  });
});
