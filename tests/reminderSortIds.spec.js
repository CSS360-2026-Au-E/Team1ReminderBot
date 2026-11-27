import { strict as assert } from "node:assert";
import remindersCommand from "../src/commands/reminders";
import reminderStore from "../src/helpers/reminderStore";

describe("Reminder sorting and IDs", function () {
  async function getReply(userId) {
    let reply;
    await remindersCommand.execute({
      user: { id: userId },
      reply: async (value) => { reply = value; },
    });
    return reply.content;
  }

  it("sorts upcoming reminders soonest first", async function () {
    const userId = "sort-test-user";
    const now = Date.now();

    reminderStore.addReminder(userId, "Later task", now + 600000);
    reminderStore.addReminder(userId, "Sooner task", now + 60000);

    const content = await getReply(userId);

    assert.ok(content.includes("Sooner task"));
    assert.ok(content.includes("Later task"));
    assert.ok(content.indexOf("Sooner task") <
              content.indexOf("Later task"));
  });

  it("displays the unique reminder ID", async function () {
    const userId = "id-test-user";
    const reminder = reminderStore.addReminder(
      userId, "ID test task", Date.now() + 60000
    );

    const content = await getReply(userId);

    assert.ok(content.includes(`ID: ${reminder.id}`));
  });
});
