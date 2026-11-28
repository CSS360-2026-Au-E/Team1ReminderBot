import { expect } from "chai";
import { MessageFlags } from "discord.js";
import ping from "../src/commands/ping";
import testwelcome from "../src/commands/testwelcome";
import reminders from "../src/commands/reminders";
import placeReminders from "../src/commands/placeReminders";
import reminderStore from "../src/helpers/reminderStore";
import { getWelcomeMessage } from "../src/events/guildMemberAdd";
import reminder from "../src/commands/reminder";

// Minimal stand-in for a Discord interaction: records what the command replies.
const fakeInteraction = ({
  user,
  optionUser = null,
  ping = 42,
  place = null,
}) => {
  const replies = [];

  return {
    replies,
    user,
    client: { ws: { ping } },
    options: {
      getUser: () => optionUser,
      getString: (name) => (name === "place" ? place : null),
    },
    reply: async (message) => replies.push(message),
  };
};

describe("slash commands", () => {
  it("each command has a name and description", () => {
    for (const command of [ping, testwelcome, reminders, placeReminders]) {
      const data = command.data.toJSON();
      expect(data.name).to.be.a("string").and.not.empty;
      expect(data.description).to.be.a("string").and.not.empty;
    }
  });

  it("/ping replies with the latency", async () => {
    const interaction = fakeInteraction({ user: { id: "1" }, ping: 57 });
    await ping.execute(interaction);
    expect(interaction.replies[0]).to.include("57 ms");
  });

  it("/testwelcome sends the join welcome for the caller", async () => {
    const interaction = fakeInteraction({ user: { id: "111" } });
    await testwelcome.execute(interaction);
    expect(interaction.replies[0]).to.deep.equal(getWelcomeMessage("111"));
  });

  it("/testwelcome welcomes the chosen user when one is given", async () => {
    const interaction = fakeInteraction({
      user: { id: "111" },
      optionUser: { id: "222" },
    });
    await testwelcome.execute(interaction);
    expect(interaction.replies[0].content).to.include("<@222>");
  });

  it("/reminders shows a button and refreshes the list when clicked", async () => {
    const userId = "reminders-button-test";
    const reminder = reminderStore.addReminder(
      userId,
      "Review architecture",
      Date.now() + 60000
    );

    let listReply;
    await reminders.execute({
      user: { id: userId },
      reply: async (payload) => {
        listReply = payload;
      },
    });

    expect(listReply.content).to.include("Review architecture");
    expect(listReply.ephemeral).to.equal(true);
    expect(listReply.components).to.have.length(1);

    const button = listReply.components[0].toJSON().components[0];
    expect(button.custom_id).to.include(`reminders:done:${reminder.id}`);

    let updatedReply;
    await reminders.handleButton({
      customId: button.custom_id,
      user: { id: userId },
      update: async (payload) => {
        updatedReply = payload;
      },
    });

    expect(updatedReply.content).to.include("No upcoming reminders.");
    expect(updatedReply.content).to.include("Marked done");
    expect(reminderStore.getUpcomingReminders(userId)).to.have.length(0);
  });

  it("/place-reminders lists only the caller's reminders for the chosen place", async () => {
    const userId = "place-command-owner-test";

    reminderStore.addReminder(
      userId,
      "Return my book",
      Date.now() + 60000,
      "none",
      "Library"
    );
    reminderStore.addReminder(
      "another-place-command-user",
      "Private reminder",
      Date.now() + 60000,
      "none",
      "Library"
    );
    reminderStore.addReminder(
      userId,
      "Buy groceries",
      Date.now() + 60000,
      "none",
      "Market"
    );

    const interaction = fakeInteraction({
      user: { id: userId },
      place: " library ",
    });

    await placeReminders.execute(interaction);

    expect(interaction.replies[0].content).to.include("Return my book");
    expect(interaction.replies[0].content).not.to.include("Private reminder");
    expect(interaction.replies[0].content).not.to.include("Buy groceries");
    expect(interaction.replies[0].flags).to.equal(MessageFlags.Ephemeral);
  });

  it("/reminder saves the selected place", async () => {
  const userId = "reminder-place-command-test";
  const replies = [];

  const interaction = {
    user: { id: userId },
    options: {
      getString: (name) =>
        ({
          message: "Return my book",
          unit: "minute",
          place: "Library",
        })[name] ?? null,
      getInteger: (name) => (name === "amount" ? 1 : null),
    },
    reply: async (payload) => replies.push(payload),
  };

  await reminder.execute(interaction);

  const saved = reminderStore.getUpcomingRemindersByPlace(
    userId,
    "library"
  );

  expect(saved).to.have.length(1);
  expect(saved[0].message).to.equal("Return my book");
  expect(replies[0].content).to.include("Library");
  });
});