
const { SlashCommandBuilder } = require("discord.js");
const reminderStore = require("../helpers/reminderStore.js");

const command = {
  data: new SlashCommandBuilder()
    .setName("remind")
    .setDescription("Set a reminder.")
    .addIntegerOption((option) =>
      option
        .setName("amount")
        .setDescription("How long to wait")
        .setMinValue(1)
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("unit")
        .setDescription("The unit of time")
        .setRequired(true)
        .addChoices(
          { name: "Seconds", value: "second" },
          { name: "Minutes", value: "minute" },
          { name: "Hours", value: "hour" },
          { name: "Days", value: "day" }
        )
    )
    .addStringOption((option) =>
      option
        .setName("message")
        .setDescription("What do you want to be reminded about?")
        .setRequired(true)
    ),

  async execute(interaction) {
    try {

      const amount = interaction.options.getInteger("amount");
      const unit = interaction.options.getString("unit");
      const message = interaction.options.getString("message");

      // Validate required options.
      if (amount === null || unit === null || message === null) {
        throw new Error("Missing required reminder options.");
      }

      const multipliers = {
        second: 1000,
        minute: 60 * 1000,
        hour: 60 * 60 * 1000,
        day: 24 * 60 * 60 * 1000,
      };

      const multiplier = multipliers[unit];

      if (!multiplier) {
        throw new Error("Invalid reminder time unit.");
      }

      const duration = amount * multiplier;

      if (!Number.isFinite(duration)) {
        throw new Error("Invalid reminder duration.");
      }

      const dueTime = Date.now() + duration;

      // Save the reminder.
      reminderStore.addReminder(
        interaction.user.id,
        message,
        dueTime
      );

      const durationStr = `${amount} ${unit}${amount === 1 ? "" : "s"}`;

      await interaction.reply({
        content:
          `⏰ Reminder set successfully!\n` +
          `**Message:** ${message}\n` +
          `**Time:** ${durationStr}`,
        ephemeral: true,
      });

      console.log(`Reminder created: ${durationStr}`);

    } catch (error) {
      console.error("Error setting reminder:", error);

      const response = {
        content: "Failed to set your reminder. Please try again.",
        ephemeral: true,
      };

      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(response);
      } else {
        await interaction.reply(response);
      }
    }
  },
};

module.exports = command;
module.exports.default = command;
