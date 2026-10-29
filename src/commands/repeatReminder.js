
import { SlashCommandBuilder, MessageFlags } from "discord.js";
import reminderStore from "../helpers/reminderStore.js";

const { addReminder } = reminderStore;

const command = {
  data: new SlashCommandBuilder()
    .setName("repeatreminder")
    .setDescription("Create a daily or weekly reminder")
    .addStringOption((option) =>
      option
        .setName("message")
        .setDescription("What should I remind you about?")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("repeat")
        .setDescription("How often should this reminder repeat?")
        .setRequired(true)
        .addChoices(
          { name: "Daily", value: "daily" },
          { name: "Weekly", value: "weekly" }
        )
    )
    .addIntegerOption((option) =>
      option
        .setName("minutes")
        .setDescription("Minutes until the first reminder")
        .setMinValue(1)
        .setMaxValue(10080)
        .setRequired(true)
    ),

  async execute(interaction) {
    const message = interaction.options.getString("message");
    const repeat = interaction.options.getString("repeat");
    const minutes = interaction.options.getInteger("minutes");

    const firstRun = Date.now() + minutes * 60 * 1000;

    addReminder(interaction.user.id, message, firstRun, repeat);

    await interaction.reply({
      content: `Reminder created! I'll remind you about "${message}" ${repeat}, starting in ${minutes} minute(s).`,
      flags: MessageFlags.Ephemeral,
    });
  },
};

export default command;
