import { expect } from "chai";
import ping from "../src/commands/ping";
import testwelcome from "../src/commands/testwelcome";
import reminders from "../src/commands/reminders";
import reminderStore from "../src/helpers/reminderStore";
import { getWelcomeMessage } from "../src/events/guildMemberAdd";

// Minimal stand-in for a Discord interaction: records what the command replies.
const fakeInteraction = ({ user, optionUser = null, ping = 42 }) => {
  const replies = [];
  return {
    replies,
    user,
    client: { ws: { ping } },
    options: { getUser: () => optionUser },
    reply: async (message) => replies.push(message),
  };
};

describe("slash commands", () => {
  it("each command has a name and description", () => {
    for (const command of [ping, testwelcome, reminders]) {
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
});