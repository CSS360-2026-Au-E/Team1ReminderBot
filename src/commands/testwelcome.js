import { SlashCommandBuilder } from "discord.js";
import { getWelcomeMessage } from "../events/guildMemberAdd";

const command = {
  data: new SlashCommandBuilder()
    .setName("testwelcome")
    .setDescription("Show the welcome message the bot sends when someone joins.")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("Who to welcome (defaults to you)")
        .setRequired(false)
    ),
  async execute(interaction) {
    /*
      Sends the same message as the guildMemberAdd event, so the welcome
      can be tested without someone leaving and rejoining the server.
    */
    const user = interaction.options.getUser("user") ?? interaction.user;
    await interaction.reply(getWelcomeMessage(user.id));
  },
};

export default command;
