import { SlashCommandBuilder } from "discord.js";

const command = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Check that the bot is online and see its response time."),
  async execute(interaction) {
    /*
      Health check: replies with the gateway latency so the team can
      confirm the bot is running in a server.
    */
    const latency = Math.round(interaction.client.ws.ping);
    await interaction.reply(`Pong! Bot is online (latency ${latency} ms).`);
  },
};

export default command;
