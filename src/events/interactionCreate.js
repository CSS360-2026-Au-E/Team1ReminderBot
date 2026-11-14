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