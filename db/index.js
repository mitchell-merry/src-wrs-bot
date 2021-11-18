const Sequelize = require('sequelize');
const config = require('../config');

const sync = async (sequelize) => {
    const models = {
        Guild: require('./models/Guild.model').init(sequelize),
        User: require('./models/User.model').init(sequelize),
        Leaderboard: require('./models/Leaderboard.model').init(sequelize),
        LeaderboardVariable: require('./models/LeaderboardVariable.model').init(sequelize),
        TrackedLeaderboard: require('./models/TrackedLeaderboard.model').init(sequelize),
    };

    // code i found on stackoverflow to help me debug & write code
    await Object.values(models)
        .filter(model => typeof model.associate === "function")
        .forEach(model => model.associate(models));


    //     for (let model of Object.keys(models)) {
    //         if(models[model].name === 'Sequelize')
    //            continue;
    //         if(!models[model].name)
    //           continue;
          
    //         console.log("\n\n----------------------------------\n", 
    //         models[model].name, 
    //         "\n----------------------------------");
          
            
    //         console.log("\nAssociations");
    //         for (let assoc of Object.keys(models[model].associations)) {
    //           for (let accessor of Object.keys(models[model].associations[assoc].accessors)) {
    //             console.log(models[model].name + '.' + models[model].associations[assoc].accessors[accessor]+'()');
    //           }
    //         }
    //       }
    
    await sequelize.sync({ force: true });
}

const connect = async () => {
    const sequelize = await new Sequelize({
        dialect: 'sqlite',
        storage: './database.sqlite'
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

const syncGuilds = async (guilds) => {
    const { Guild } = config.mysql.client.models;
    for(let guild of guilds) {
        const G = await Guild.findByPk(guild[0]);
        if(!G) {
            console.log(`Syncing guild ${guild[0]}...`)
            Guild.create( {guild_id: guild[0] })
        }
    }
}

module.exports = {
    connect,
    sync,
    syncGuilds,
};