import { startReminderScheduler } from "../helpers/reminderScheduler.js";
const event = {
  name: "ready",
  once: true,
  async execute(client) {
    console.log(`
    ############################################################
    #  Logged in as ${client.user.username}!
    #  Serving ${client.guilds.cache.size} servers.
    #  Serving ${client.users.cache.size} users.
    ############################################################
  `);
    await registerCommands(client);
    startReminderScheduler(client);
  },
};

const registerCommands = async (client) => {
  /*
    Registers the slash commands in every server the bot is in.
    Server-level commands show up right away, unlike global ones.
  */
  const commandData = client.commands.map((command) => command.data.toJSON());

  for (const guild of client.guilds.cache.values()) {
    try {
      await guild.commands.set(commandData);
      console.log(`Registered ${commandData.length} commands in ${guild.name}`);
    } catch (error) {
      console.error(`Could not register commands in ${guild.name}:`, error.message);
    }
  }
};

export default event;
