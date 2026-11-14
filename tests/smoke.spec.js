
import { expect } from "chai";
import ping from "../src/commands/ping";
import testwelcome from "../src/commands/testwelcome";
import reminders from "../src/commands/reminders";
import reminderStore from "../src/helpers/reminderStore";
import { getWelcomeMessage } from "../src/events/guildMemberAdd";
import messageCreate from "../src/events/messageCreate";

describe("Bot core smoke tests", () => {
  it("/ping responds with bot latency", async () => {
    const replies = [];

    await ping.execute({
      client: { ws: { ping: 42 } },
      reply: async (message) => replies.push(message),
    });

    expect(replies[0]).to.include("42 ms");
  });

  it("/testwelcome produces a welcome message", async () => {
    const replies = [];

    await testwelcome.execute({
      user: { id: "123" },
      options: { getUser: () => null },
      reply: async (message) => replies.push(message),
    });

    expect(replies[0]).to.deep.equal(getWelcomeMessage("123"));
  });

  it("/reminders lists an upcoming reminder", async () => {
    const userId = "smoke-test-user";

    reminderStore.addReminder(
      userId,
      "Smoke test assignment",
      Date.now() + 60000
    );

    let response;

    await reminders.execute({
      user: { id: userId },
      reply: async (message) => {
        response = message;
      },
    });

    expect(response.content).to.include("Smoke test assignment");
  });

  it("!addreminder schedules an assignment reminder", async () => {
    const replies = [];
    const originalSetTimeout = global.setTimeout;
    const delays = [];

    global.setTimeout = (callback, delay) => {
      delays.push(delay);
      return 1;
    };

    try {
      const deadline = new Date(Date.now() + 48 * 60 * 60 * 1000);
      const date = deadline.toISOString().slice(0, 10);
      const time = deadline.toISOString().slice(11, 16);

      await messageCreate.execute({
        author: { bot: false },
        guild: { id: "test-server" },
        content: `!addreminder ${date} ${time} Smoke assignment`,
        reply: async (message) => replies.push(message),
        channel: { send: async () => {} },
      });

      expect(replies[0]).to.include("Reminders scheduled");
      expect(delays.length).to.be.greaterThan(0);
    } finally {
      global.setTimeout = originalSetTimeout;
    }
  });
});
