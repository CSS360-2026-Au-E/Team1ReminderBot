import { expect } from "chai";
import ping from "../src/commands/ping";
import testwelcome from "../src/commands/testwelcome";
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
    for (const command of [ping, testwelcome]) {
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
});
