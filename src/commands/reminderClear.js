
import { SlashCommandBuilder, MessageFlags } from "discord.js";
import reminderStore from "../helpers/reminderStore.js";

const { clearCompletedReminders } = reminderStore;

export default {
  data: new SlashCommandBuilder()
    .setName("reminder-clear")
    .setDescription("Clear your completed reminders"),

  async execute(interaction) {
    const cleared = clearCompletedReminders(interaction.user.id);

    await interaction.reply({
      content: `Cleared ${cleared} completed reminder(s).`,
      flags: MessageFlags.Ephemeral,
    });
  },
};
