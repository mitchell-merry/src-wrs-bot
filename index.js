import { Client } from 'discord.js';
import fetch from 'node-fetch';
const client = new Client({ intents: [] });

import { token } from './auth';
import * as db from './db/index.js';

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

    console.log(await getAllLeaderboardsForGuild(sequelize.models, '705780146216370326'));

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
            through: { attributes: [] },
            attributes: { exclude: [ 'lb_id', 'wr_holder_id', 'wr_run_id' ] },
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

const pref = 'https://www.speedrun.com/api/v1/'

/*
    leaderboard needs the following attributes at least
    {
        game_id: string,
        category_id: string,
        variables: [{
            variable_id: string,
            value: string
        }, ...]
    }
*/
const getLeaderboardName = async (leaderboard) => {
    // let req = `${pref}leaderboards/${leaderboard.game_id}/category/${leaderboard.category_id}?embed=game,category,variables&${
    //     variableListToURLParamaters(leaderboard.variables)
    // }`;
    let req = `${pref}games/${leaderboard.game_id}?embed=categories,variables`;

    const game = await fetch(req).then(res => res.json());
    
    console.log(JSON.stringify(game, null, 2));
    // res.data.names.international
    // res.data.categories.data[...].id
    // res.data.variables.data.

    let name = `${game.data.names.international} - ${game.data.categories.data.find(c => c.id === leaderboard.category_id).name}`;

    if(leaderboard.variables && leaderboard.variables.length > 0) {
        name += ` (${
            // Just so much fun
            leaderboard.variables.map(v => {
                return game.data.variables.data.find(t => t.id === v.variable_id).values.values[v.value].label;
            }).join(', ')
        })`;
    }

    return name;
}

const variableListToURLParameters = async (variables) => {
    return leaderboard.variables.map(variable => `var-${variable.variable_id}=${variable.value}`).join('&');
}