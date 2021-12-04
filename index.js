import { Client, Intents } from 'discord.js';
const client = new Client({ 
    intents: [ 
        Intents.FLAGS.GUILDS, 
        Intents.FLAGS.GUILD_MEMBERS, 
        Intents.FLAGS.GUILD_PRESENCES, 
        Intents.FLAGS.GUILD_MESSAGES, 
        Intents.FLAGS.DIRECT_MESSAGES
    ],
    partials: [
        "CHANNEL"
    ]
});

import { token } from './auth';
import * as db from './db/index.js';
import config from './config';
import { receiveDM } from './discord/associate.command';
import { Collection } from '@discordjs/collection';
import * as fs from 'fs';
import lang from './lang';

// Initialisation code to be run after the discord client has logged in.
const init = async () => {
    config.discord_client = client;
    
    // Log all the guilds the bot is in.
    console.log(`Client is ready in the following Guilds: [${client.guilds.cache.size}]`);
    client.guilds.cache.forEach(g => {
        console.log(`[${g.id}] ${g.available ? g.name : "UNAVAILABLE"} `)
    });

    // Retrieve commands
    retreiveCommands(client);

    // Database
    console.log("Setting up the SQLite database...");
    config.sequelize = await db.connect();
    console.log("Database successfully initialised.");

    await db.syncGuilds(client.guilds.cache);

    config.ready = true;
    console.log("Bot is ready.");

};

const retreiveCommands = async (client) => {
    client.commands = new Collection();

    const commandFiles = fs.readdirSync('./discord').filter(file => file.endsWith('.command.js'));

    for (const file of commandFiles) {
        const { default: command } = await import(`./discord/${file}`);
        
        client.commands.set(command.data.name, command);
    }
}

client.once('ready', init);
client.login(token);

client.on('interactionCreate', async (interaction) => {
	if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);
	if (!command) return interaction.editReply({ content: lang.UNKNOWN_COMMAND });

	try {
        await interaction.deferReply();
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.editReply({ content: lang.UNKNOWN_ERROR });
	}    

});

client.on('messageCreate', async (message) => {
    if(message.author.bot || !config.ready) return;

    if(message.channel.type === 'DM') receiveDM(message);
});