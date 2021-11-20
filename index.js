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

const pref = 'https://www.speedrun.com/api/v1/'


const variableListToURLParameters = (variables) => {
    return variables.map(variable => `var-${variable.variable_id}=${variable.value}`).join('&');
}

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
    let req = `${pref}leaderboards/${leaderboard.game_id}/category/${leaderboard.category_id}?embed=game,category,variables,players&top=1&${
        variableListToURLParameters(leaderboard.variables)
    }`;
    // let req = `${pref}games/${leaderboard.game_id}/records?scope=full-game&top=1&embed=categories,variables`;
    const lb = await fetch(req).then(res => res.json());
    
    // console.log(JSON.stringify(lb.data, null, 2));
    // console.log(lb.runs.map(r => r.run.players.))
    // return req;
    // res.data.names.international
    // res.data.categories.data[...].id
    // res.data.variables.data.

    let name = `${lb.data.game.data.names.international} - ${lb.data.category.data.name}`;

    if(leaderboard.variables && leaderboard.variables.length > 0) {
        name += ` (${
            // Just so much fun
            leaderboard.variables.map(v => {
                return lb.data.variables.data.find(t => t.id === v.variable_id).values.values[v.value].label;
            }).join(', ')
        })`;
    }

    name += ` by: ${getPlayersFromRuns(lb.data.runs, lb.data.players)}`;

    return name;
}

const getPlayersFromRuns = (runs, players) => {
    return runs.map(run => `[${run.run.players.map(p => players.data.find(p_ => p_.id === p.id).names.international)} in ${timeFormatting(run.run.times.primary_t)}]`).join(', ');
}

const timeFormatting = (time) => {
    let hours = Math.floor(time/3600);
    let minutes = Math.floor(time / 60) % 60;
    let seconds = Math.floor(time % 60);
    let milli = Math.round((time % 1) * 1000)
    return (hours !== 0 ? `${hours}:${(minutes < 10 ? '0' : '')}` : '') 
    + `${minutes}:${(seconds < 10 ? '0' : '')}${seconds}${milli !== 0 ? '.'+milli : ''}`;
}