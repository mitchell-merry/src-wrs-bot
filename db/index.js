import Sequelize from 'sequelize';
import * as m from './models';

const TESTING = false;

export const sync = async (sequelize) => {

    const models = {
        Guild: m.Guild.init(sequelize),
        Player: m.Player.init(sequelize),
        Leaderboard: m.Leaderboard.init(sequelize),
        Variable: m.Variable.init(sequelize),
        TrackedLeaderboard: m.TrackedLeaderboard.init(sequelize),
    };

    // Associate the models using their associate functions
    await Object.values(models)
        .filter(model => typeof model.associate === "function")
        .forEach(model => model.associate(models));
    
    await sequelize.sync({ force: TESTING });

    // logModelAssociations(models);

    if(TESTING) await dummyData(models);
}

export const connect = async () => {
    const sequelize = await new Sequelize({
        dialect: 'sqlite',
        storage: './database.sqlite',
        logging: false
    });

    await sequelize.authenticate()
        .then(() => {
            console.info("Successfully connected to SQLite database.");
        })
        .catch((error) => {
            console.error(error);
            process.exit(1);
        });
        
    await sync(sequelize);

    return sequelize;
}

const dummyData = async (models) => {
    const { Guild, Leaderboard, Variable, Player } = models;

    // console.log(Object.entries(Guild));
    // console.log(Object.entries(Leaderboard));

    await Guild.create({
        guild_id: '867962530964848680',
        hoisted_role_id: '911883658250575913',
        role_default_color: 'YELLOW', 
        track_sum: true,
        Leaderboards: [{
            game_id: 'm1zj9r06', 
            category_id: 'wkp9pl02',
        }, {
            game_id: 'm1mnepkd', 
            category_id: 'n2yvqne2',
        }, {
            game_id: 'j1lq9qz6', 
            category_id: '7dgmx0pd',
        }, {
            game_id: 'j1lq9qz6', 
            category_id: 'mkexvl6d',
        }, {
            game_id: 'y6550w36', 
            category_id: 'jdrr8jnd',
        }, {
            game_id: '9do88le1', 
            category_id: 'wk60q8rk',
        }, {
            game_id: 'y654kg7d', 
            category_id: 'xd1l9xrk',
            // TODO figure out the mystery of the century - why does this nested include seemingly get ignored?
            Variables: [{
                variable_id: 'ylqkj9ml',
                value: 'zqorkrpq'
            }],
        }]
    }, {
        // include: [ Leaderboard ]
        // https://sequelize.org/master/manual/creating-with-associations.html
        include: [{
            model: Leaderboard,
            association: Guild.associations.Leaderboards,
            include: [{ 
                model: Variable,
                association: Leaderboard.associations.Variables
            }]
            // include: [ Variable ]
            // include: [{ association: Leaderboard.Variables }]
        }],
        // include: [{ 
        //     association: Guild.Leaderboards,
        //     include: [ Leaderboard.Variables ]
        // }],
    });
    
    // temp (stand-in for the above bug)
    await Variable.create({
        lb_id: 7,
        variable_id: 'ylqkj9ml',
        value: 'zqorkrpq'
    });

    // Manually add user data (limitation of SRC api, hopefully temporary)
    await Player.bulkCreate([{
        player_id: 'qjoz6gn8',
        discord_id: '270856336466509835'
    }, {
        player_id: '8en3o968',
        discord_id: '229503851697405953'
    }, {
        player_id: '8vogmevx',
        discord_id: '880753493835669564'
    }, {
        player_id: 'jop6zmex',
        discord_id: '775882249597616158'
    }]);
}

const syncGuilds = async (guilds) => {
    // const { Guild } = config.mysql.client.models;
    // for(let guild of guilds) {
    //     const G = await Guild.findByPk(guild[0]);
    //     if(!G) {
    //         console.log(`Syncing guild ${guild[0]}...`)
    //         Guild.create( {guild_id: guild[0] })
    //     }
    // }
}

// code i found on stackoverflow to help me debug & write code
export const logModelAssociations = async (models) => {
    for (let model of Object.keys(models)) {
        if(models[model].name === 'Sequelize')
            continue;
        if(!models[model].name)
            continue;
        
        console.log("\n\n----------------------------------\n", 
        models[model].name, 
        "\n----------------------------------");
        
        
        console.log("\nAssociations");
        for (let assoc of Object.keys(models[model].associations)) {
            for (let accessor of Object.keys(models[model].associations[assoc].accessors)) {
                console.log(models[model].name + '.' + models[model].associations[assoc].accessors[accessor]+'()');
            }
        }
    }
}