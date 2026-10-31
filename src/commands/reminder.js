import { SlashCommandBuilder, MessageFlags } from "discord.js";
import reminderStore from "../helpers/reminderStore.js";
import { buildReminderTimes, MAX_OFFSETS } from "../helpers/reminderTime.js";

const { addReminder } = reminderStore;

// Discord renders <t:...> in each viewer's own time zone.
const discordTime = (ms) => `<t:${Math.floor(ms / 1000)}:f> (<t:${Math.floor(ms / 1000)}:R>)`;

const command = {
  data: new SlashCommandBuilder()
    .setName("reminder")
    .setDescription("Set a reminder for a time from now or a date, with extra reminders before it.")
    .addStringOption((option) =>
      option
        .setName("message")
        .setDescription("What should I remind you about?")
        .setMaxLength(1500)
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("amount")
        .setDescription("How many units of time from now (use with unit)")
        .setMinValue(1)
    )
    .addStringOption((option) =>
      option
        .setName("unit")
        .setDescription("The unit of time (use with amount)")
        .addChoices(
          { name: "Seconds", value: "second" },
          { name: "Minutes", value: "minute" },
          { name: "Hours", value: "hour" },
          { name: "Days", value: "day" }
        )
    )
    .addStringOption((option) =>
      option
        .setName("date")
        .setDescription("Event date and time, Pacific: YYYY-MM-DD HH:MM (instead of amount and unit)")
    )
    .addStringOption((option) =>
      option
        .setName("before")
        .setDescription(`Extra reminders before the event, up to ${MAX_OFFSETS}, e.g. 1d, 2h, 30m`)
    ),

  async execute(interaction) {
    const message = interaction.options.getString("message", true);

    let plan;
    try {
      plan = buildReminderTimes({
        amount: interaction.options.getInteger("amount"),
        unit: interaction.options.getString("unit"),
        date: interaction.options.getString("date"),
        before: interaction.options.getString("before"),
      });
    } catch (error) {
      await interaction.reply({ content: error.message, flags: MessageFlags.Ephemeral });
      return;
    }

    for (const { time, label } of plan.times) {
      const text = label === "at the event" ? message : `${message} (${label})`;
      addReminder(interaction.user.id, text, time);
    }

    const lines = plan.times.map(({ time, label }) => `- ${discordTime(time)}, ${label}`);
    if (plan.skipped.length) {
      lines.push(`Skipped ${plan.skipped.join(", ")} before, since that time already passed.`);
    }

    await interaction.reply({
      content: `Reminder set for "${message}". I'll DM you:\n${lines.join("\n")}`,
      flags: MessageFlags.Ephemeral,
    });
  },
};

export default command;
