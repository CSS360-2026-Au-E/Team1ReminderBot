import { SlashCommandBuilder, MessageFlags } from "discord.js";
import reminderStore from "../helpers/reminderStore.js";

const { getUpcomingRemindersByPlace } = reminderStore;

const command = {
  data: new SlashCommandBuilder()
    .setName("place-reminders")
    .setDescription("View your upcoming reminders for a place.")
    .addStringOption((option) =>
      option
        .setName("place")
        .setDescription("Which place should I look for?")
        .setMaxLength(100)
        .setRequired(true)
    ),

  async execute(interaction) {
    const place = interaction.options.getString("place", true).trim();
    const reminders = getUpcomingRemindersByPlace(interaction.user.id, place);

    if (reminders.length === 0) {
      await interaction.reply({
        content: `You have no upcoming reminders for **${place}**.`,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const reminderList = reminders
      .map(
        (reminder) =>
          `- ${reminder.message} (Next: ${new Date(
            reminder.nextRun
          ).toLocaleString()})`
      )
      .join("\n");

    await interaction.reply({
      content: `**Your upcoming reminders at ${place}:**\n${reminderList}\n\nUse \`/reminders\` to mark a reminder done.`,
      flags: MessageFlags.Ephemeral,
    });
  },
};

export default command;