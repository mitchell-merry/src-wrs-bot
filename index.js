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

client.on('messageCreate', async (message) => {
    if(message.author.bot || !config.ready) return;

    if(message.channel.type === 'DM') receiveDM(message);
    else if(message.content.startsWith(config.command_prefix)) {
        const command = message.content.split(' ')[0].slice(config.command_prefix.length).toLowerCase();
        // is command
        if(command === 'update') updateGuild(message.guild.id);
        else if(command === 'associate') {
            await message.author.send(`To associate your speedrun.com account with your discord account, you need to provide your src API key. You can access it here: https://www.speedrun.com/api/auth.\n
We do not store your API key. This bot is open-source and the code is available at https://github.com/mitchell-merry/src-wrs-bot/blob/main/discord/associate.js, for you to read and see what we do with your API key.\n
You will be able to refresh your API key immediately after linking and functionality will remain. To unlink your account, you can type 'unlink' in this DM at any time.\n
To link your account, send your API key (and only your API key) in these DMs, here.`
            );
            await message.channel.send('You should\'ve been sent a DM with instructions on how to link your account. Make sure you have DMs open.');
        }
    }
});