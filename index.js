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
import { updateGuild } from './discord/update';
import { receiveDM } from './discord/associate';

// Initialisation code to be run after the discord client has logged in.
const init = async () => {
    config.discord_client = client;
    
    // Log all the guilds the bot is in.
    console.log(`Client is ready in the following Guilds: [${client.guilds.cache.size}]`);
    client.guilds.cache.forEach(g => {
        console.log(`[${g.id}] ${g.available ? g.name : "UNAVAILABLE"} `)
    });

    // Database
    console.log("Setting up the SQLite database...");
    config.sequelize = await db.connect();
    console.log("Database successfully initialised.");

    // await updateGuild('867962530964848680');
    config.ready = true;
};

client.once('ready', init);
client.login(token);

client.on('messageCreate', (message) => {
    if(message.author.bot || !config.ready) return;

    if(message.channel.type === 'DM') receiveDM(message);

    if(message.content.startsWith(config.command_prefix)) {
        const command = message.content.split(' ')[0].slice(config.command_prefix.length).toLowerCase();
        // is command
        if(command === 'update') updateGuild(message.guild.id);
    }
});