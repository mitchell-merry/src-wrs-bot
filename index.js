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

    console.log(await getAllLeaderboardsForGuild(sequelize.models, '705780146216370326'));

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
            exclude: [ 'wr_holder_id', 'wr_run_id' ],
            include: [{ 
                model: Variable,
                exclude: ["lb_id"]
            }]
        }
    });
    console.log(JSON.stringify(G, null, 2));
    
    const lb_names = [];
    for(const board of G.Leaderboards) {
        const b = { game_id: board.game_id, category_id: board.category_id, variables: [ ...board.Variables ] }
        // console.log(JSON.stringify(b, null, 2));
        console.log(await getLeaderboardName(b))
    }

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
    fetch(req).then(res => console.log(JSON.stringify(res, null, 2)));
    // fetch()
}

const variableListToURLParameters = async (variables) => {
    return leaderboard.variables.map(variable => `var-${variable.variable_id}=${variable.value}`).join('&');
}