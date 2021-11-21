import { Client } from 'discord.js';
const client = new Client({ intents: [] });

import { token } from './auth';
import * as db from './db/index.js';
import config from './config';
import { updateGuild } from './discord/update'

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

    updateGuild('705780146216370326');

    // console.log(await getAllLeaderboardsForGuild(sequelize.models, '705780146216370326'));

    // const { Guild, Leaderboard, Variable } = sequelize.models;

    // Guild.findByPk('705780146216370326', {
    //     include: {
    //         model: Leaderboard,
    //         through: { attributes: [] },
    //         attributes: { exclude: [ 'lb_id', 'wr_holder_id', 'wr_run_id' ] },
    //         include: [{ 
    //             model: Variable,
    //             attributes: { exclude: ['lb_id'] }
    //         }]
    //     },
    //     attributes: {
    //         exclude: [ 'guild_id', 'wr_message_id', 'wr_role_color' ]
    //     }
    // })
    // .then((res) => console.log(JSON.stringify(res, null, 2)));

    // await sequelize.models.Leaderboard.findAll()
    //     .then((res) => console.log(JSON.stringify(res, null, 2)));

    // Interact with the src API and update world records accordingly
};

client.once('ready', init);
client.login(token);

// Temp stuff playing around with

/*
const G = await Guild.findByPk(guild_id, {
        include: {
            model: Leaderboard,
            through: { attributes: [] },
            include: [{ 
                model: Variable,
                exclude: ["lb_id"]
            }, {
                model: User,
                as: "WRHolder"
            }]
        }
    })
    */

const getAllLeaderboardsForGuild = async (models, guild_id) => {
    const { Guild, Leaderboard, Variable, User } = models;
    
    const G = await Guild.findByPk(guild_id, {
        include: {
            model: Leaderboard,
            through: { attributes: [ ] },
            attributes: { exclude: [ 'lb_id' ] },
            include: [{ 
                model: Variable,
                attributes: { exclude: ['lb_id'] }
            }]
        },
        attributes: {
            exclude: [ 'guild_id', 'wr_message_id', 'wr_role_color' ]
        }
    });
    console.log(JSON.stringify(G, null, 2));

    const lb_names = [];
    for(const board of G.Leaderboards) {
        const b = { game_id: board.game_id, category_id: board.category_id, variables: [ ...board.Variables ] }
        // console.log(JSON.stringify(b, null, 2));
        lb_names.push(await getLeaderboardName(b));
    }

    return lb_names;
}
