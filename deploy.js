require('dotenv').config();
const { REST, Routes } = require('discord.js');
const remindCommand = require('./src/commands/remind.js');

const token = process.env.TOKEN;
const rest = new REST({ version: '10' }).setToken(token);

(async () => {
    try {
        const clientId = Buffer.from(token.split('.')[0], 'base64').toString();
        await rest.put(
            Routes.applicationCommands(clientId),
            { body: [remindCommand.data.toJSON()] },
        );
        console.log('Successfully registered command!');
    } catch (error) {
        console.error(error);
    }
})();