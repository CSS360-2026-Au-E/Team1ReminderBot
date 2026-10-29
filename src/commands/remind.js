import { SlashCommandBuilder } from "discord.js";

const command = {
  data: new SlashCommandBuilder()
    .setName("reminder")
    .setDescription("Enter how long to wait before a reminder.")
    .addIntegerOption((option) =>
      option
        .setName("amount")
        .setDescription("How many units of time to wait")
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
    ),
  async execute(interaction) {
    const amount = interaction.options.getInteger("amount", true);
    const unit = interaction.options.getString("unit", true);
    const duration = `${amount} ${unit}${amount === 1 ? "" : "s"}`;

    // Only collect the duration for now; scheduling will be added later.
    await interaction.reply({
      content: `Reminder duration received: ${duration}. Reminder delivery is not enabled yet.`,
      ephemeral: true,
    });
  },
};

export default command;
