import reminderStore from "../helpers/reminderStore.js";
const event = {
  name: "interactionCreate",
  async execute(interaction, client) {
    if (interaction.isButton() && interaction.customId.startsWith("reminders:")) {
      const remindersCommand = client.commands.get("reminders");
      if (!remindersCommand?.handleButton) return;

      try {
        await remindersCommand.handleButton(interaction);
      } catch (error) {
        console.error("Error handling reminder button:", error);
        const reply = {
          content: "Something went wrong updating that reminder.",
          ephemeral: true,
        };

        if (interaction.replied || interaction.deferred) {
          await interaction.followUp(reply);
        } else {
          await interaction.reply(reply);
        }
      }

      return;
    }


    if (interaction.isButton() && interaction.customId.startsWith("snooze:")) {
      const [, reminderId, scheduledTime] = interaction.customId.split(":");
      const reminder = reminderStore.getAllReminders().find(
        (item) => item.id === reminderId && item.userId === interaction.user.id
      );

      if (!reminder || !reminder.history.includes(Number(scheduledTime)) ||
          reminder.nextRun === Number(scheduledTime) ||
          reminder.completedAt !== null) {
        await interaction.reply({
          content: "This reminder can no longer be snoozed.",
          ephemeral: true,
        });
        return;
      }

      const success = reminderStore.snoozeReminder(interaction.user.id, reminderId);

      if (success) {
        await interaction.update({
          content: `⏰ Reminder: ${reminder.message}\n💤 Snoozed for 5 minutes!`,
          components: [],
        });
      } else {
        await interaction.reply({
          content: "Could not snooze this reminder.",
          ephemeral: true,
        });
      }
      return;
    }

    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(`Error running /${interaction.commandName}:`, error);
      const reply = {
        content: "Something went wrong running that command.",
        ephemeral: true,
      };

      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(reply);
      } else {
        await interaction.reply(reply);
      }
    }
  },
};

export default event;