
import { SlashCommandBuilder, MessageFlags } from "discord.js";
import reminderStore from "../helpers/reminderStore.js";

const { searchReminders } = reminderStore;

const command = {
  data: new SlashCommandBuilder()
    .setName("reminder-search")
    .setDescription("Search your reminders by keyword")
    .addStringOption((option) =>
      option
        .setName("keyword")
        .setDescription("Word to search for")
        .setRequired(true)
    ),

  async execute(interaction) {
    const keyword = interaction.options.getString("keyword");
    const results = searchReminders(interaction.user.id, keyword);

    if (results.length === 0) {
      return interaction.reply({
        content: "No reminders found.",
        flags: MessageFlags.Ephemeral,
      });
    }

    const message = results
      .slice(0, 10)
      .map((reminder) => `• ${reminder.message}`)
      .join("\n");

    return interaction.reply({
      content: `Search results:\n${message}`,
      flags: MessageFlags.Ephemeral,
    });
  },
};

export default command;
