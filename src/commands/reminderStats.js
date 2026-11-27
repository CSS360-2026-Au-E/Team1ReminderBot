
import { SlashCommandBuilder, MessageFlags } from "discord.js";
import reminderStore from "../helpers/reminderStore.js";

const { getReminderStats } = reminderStore;

const command = {
  data: new SlashCommandBuilder()
    .setName("reminder-stats")
    .setDescription("Show your pending and completed reminder counts"),

  async execute(interaction) {
    const { pending, completed } = getReminderStats(interaction.user.id);

    await interaction.reply({
      content: `Your Reminders:\nPending: ${pending}\nCompleted: ${completed}`,
      flags: MessageFlags.Ephemeral,
    });
  },
};

export default command;
