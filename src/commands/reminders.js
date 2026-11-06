import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  SlashCommandBuilder,
} from "discord.js";
import reminderStore from "../helpers/reminderStore.js";

const { getUpcomingReminders, getPastReminders, markReminderDone } = reminderStore;
const REMINDERS_PER_PAGE = 4;

function createReply(userId, requestedPage = 0) {
  const upcoming = getUpcomingReminders(userId);
  const past = getPastReminders(userId);
  const pageCount = Math.max(1, Math.ceil(upcoming.length / REMINDERS_PER_PAGE));
  const page = Math.min(Math.max(0, requestedPage), pageCount - 1);
  const pageReminders = upcoming.slice(
    page * REMINDERS_PER_PAGE,
    (page + 1) * REMINDERS_PER_PAGE
  );

  const upcomingText = pageReminders.length
    ? pageReminders
        .map(
          (reminder) =>
            `- ${reminder.message} (Next: ${new Date(reminder.nextRun).toLocaleString()})`
        )
        .join("\n")
    : "No upcoming reminders.";

  const pastText = past.length
    ? past
        .map(
          (reminder) =>
            `- ${reminder.message} (${reminder.status === "done" ? "Marked done" : "Sent"}: ${new Date(reminder.time).toLocaleString()})`
        )
        .join("\n")
    : "No past reminders.";

  const components = pageReminders.map((reminder) =>
    new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`reminders:done:${reminder.id}:${page}`)
        .setLabel("Mark done")
        .setStyle(ButtonStyle.Success)
    )
  );

  if (pageCount > 1) {
    components.push(
      new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`reminders:page:${page - 1}`)
          .setLabel("Previous")
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(page === 0),
        new ButtonBuilder()
          .setCustomId(`reminders:page:${page + 1}`)
          .setLabel("Next")
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(page === pageCount - 1)
      )
    );
  }

  return {
    content: `**Upcoming Reminders** (${page + 1}/${pageCount})\n${upcomingText}\n\n**Past Reminders**\n${pastText}`,
    components,
    ephemeral: true,
  };
}

const command = {
  data: new SlashCommandBuilder()
    .setName("reminders")
    .setDescription("View your upcoming and past reminders"),

  async execute(interaction) {
    await interaction.reply(createReply(interaction.user.id));
  },

  async handleButton(interaction) {
    const [namespace, action, value, pageValue] = interaction.customId.split(":");
    if (namespace !== "reminders") return;

    const userId = interaction.user.id;

    if (action === "done") {
      const completed = markReminderDone(userId, value);

      if (!completed) {
        await interaction.reply({
          content: "That reminder is no longer active or does not belong to you.",
          ephemeral: true,
        });
        return;
      }

      await interaction.update(createReply(userId, Number(pageValue)));
      return;
    }

    if (action === "page") {
      await interaction.update(createReply(userId, Number(value)));
    }
  },
};

export default command;