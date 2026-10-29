
import { SlashCommandBuilder } from "discord.js";
import reminderStore from "../helpers/reminderStore.js";

const { getUpcomingReminders, getPastReminders } = reminderStore;

const command = {
  data: new SlashCommandBuilder()
    .setName("reminders")
    .setDescription("View your upcoming and past reminders"),

  async execute(interaction) {
    const userId = interaction.user.id;

    const upcoming = getUpcomingReminders(userId);
    const past = getPastReminders(userId);

    const upcomingText = upcoming.length
      ? upcoming
          .map((r) => `- ${r.message} (Next: ${new Date(r.nextRun).toLocaleString()})`)
          .join("\n")
      : "No upcoming reminders.";

    const pastText = past.length
      ? past
          .map((r) => `- ${r.message} (${new Date(r.time).toLocaleString()})`)
          .join("\n")
      : "No past reminders.";

    await interaction.reply({
      content: `**Upcoming Reminders**\n${upcomingText}\n\n**Past Reminders**\n${pastText}`,
      ephemeral: true,
    });
  },
};

export default command;
