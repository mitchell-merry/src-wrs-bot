const { Client } = require('discord.js');
const client = new Client({ intents: [] });

// const { initialise_schemas, get_leaderboard_object } = require('./db');
const { token } = require('./auth.json');
const db = require('./db');

// Initialisation code to be run after the discord client has logged in.
const init = async () => {
    // Log all the guilds the bot is in.
    console.log(`Client is ready in the following Guilds: [${client.guilds.cache.size}]`);
    client.guilds.cache.forEach(g => {
        console.log(`[${g.id}] ${g.available ? g.name : "UNAVAILABLE"} `)
    });

    // Database
    console.log("Setting up the SQLite database...");
    const sequelize = await db.connect();
    console.log("Database successfully initialised.");

    // console.log(sequelize);
    // get_leaderboard_object(7);

    // Interact with the src API and update world records accordingly
};

client.once('ready', init);
client.login(token);