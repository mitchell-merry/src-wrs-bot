const Sequelize = require('sequelize');
const config = require('../config');

const TESTING = true;

const sync = async (sequelize) => {
    const models = {
        Guild: require('./models/Guild.model').init(sequelize),
        User: require('./models/User.model').init(sequelize),
        Leaderboard: require('./models/Leaderboard.model').init(sequelize),
        Variable: require('./models/Variable.model').init(sequelize),
        TrackedLeaderboard: require('./models/TrackedLeaderboard.model').init(sequelize),
    };

    // code i found on stackoverflow to help me debug & write code
    await Object.values(models)
        .filter(model => typeof model.associate === "function")
        .forEach(model => model.associate(models));
    
    await sequelize.sync({ force: TESTING });

    logModelAssociations(models);

    if(TESTING) await dummyData(models);
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

const dummyData = async (models) => {
    /*
        INSERT INTO Guild (guild_id, wr_role_color) VALUES 
            ('705780146216370326', 15844367);
    */
    const G = await models.Guild.create({
        guild_id: '705780146216370326',
        wr_role_color: 15844367
    });

    /*
        INSERT INTO User VALUES
            ('qjoz6gn8', 'diggity', '270856336466509835'),
            ('8en3o968', 'MildGothDaddy', '349773873031413761'),
            ('8vogmevx', 'PleasantlyGG', '544510397042917395'),
            ('jop6zmex', 'Zomb_Slays', '440320868783226890')
        
        Below is the bot IDs for testing
    */
    const d = await models.User.create({
        user_id: 'qjoz6gn8', 
        src_username: 'diggity', 
        discord_id: '270856336466509835'
    });

    const MGD = await models.User.create({
        user_id: '8en3o968', 
        src_username: 'MildGothDaddy', 
        discord_id: '234395307759108106'
    });

    const PGG = await models.User.create({
        user_id: '8vogmevx', 
        src_username: 'PleasantlyGG', 
        discord_id: '339254240012664832'
    });

    const ZS = await models.User.create({
        user_id: 'jop6zmex', 
        src_username: 'Zomb_Slays', 
        discord_id: '705780864549650493'
    });

    /*
        INSERT INTO Leaderboard (game_id, category_id, wr_holder_id, wr_run_id) VALUES
            ('m1zj9r06', 'wkp9pl02', '8en3o968', 'ylrkqdny'),
            ('m1mnepkd', 'n2yvqne2', 'qjoz6gn8', 'm37dpn4z'),
            ('j1lq9qz6', '7dgmx0pd', 'jop6zmex', 'mrnvp84y'),
            ('j1lq9qz6', 'mkexvl6d', '8en3o968', 'z1xg8wrm'),
            ('y6550w36', 'jdrr8jnd', 'jop6zmex', 'y27w1r6z'),
            ('9do88le1', 'wk60q8rk', '8vogmevx', 'm37w78wz'),
            ('y654kg7d', 'xd1l9xrk', 'jop6zmex', 'zp8k75xy')
    */
    const V = await MGD.createLeaderboard({
        game_id: 'm1zj9r06', 
        category_id: 'wkp9pl02',
        wr_run_id: 'ylrkqdny'
    });

    const LW = await d.createLeaderboard({
        game_id: 'm1mnepkd', 
        category_id: 'n2yvqne2',
        wr_run_id: 'm37dpn4z'
    });

    const CCG = await ZS.createLeaderboard({
        game_id: 'j1lq9qz6', 
        category_id: '7dgmx0pd',
        wr_run_id: 'mrnvp84y'
    });

    const CCB = await MGD.createLeaderboard({
        game_id: 'j1lq9qz6', 
        category_id: 'mkexvl6d',
        wr_run_id: 'z1xg8wrm'
    });

    const B71 = await ZS.createLeaderboard({
        game_id: 'y6550w36', 
        category_id: 'jdrr8jnd',
        wr_run_id: 'y27w1r6z'
    });

    const BB = await PGG.createLeaderboard({
        game_id: '9do88le1', 
        category_id: 'wk60q8rk',
        wr_run_id: 'm37w78wz'
    });

    const NM = await ZS.createLeaderboard({
        game_id: 'y654kg7d', 
        category_id: 'xd1l9xrk',
        wr_run_id: 'zp8k75xy',
    });

    /*
        INSERT INTO Variable VALUES
                (7, 'ylqkj9ml', 'zqorkrpq')
    */
    await NM.createVariable({
        lb_id: 7,
        variable_id: 'ylqkj9ml',
        value: 'zqorkrpq'
    });

    /*
        INSERT INTO TrackedLeaderboard VALUES
            ('705780146216370326', 1),
            ('705780146216370326', 2),
            ('705780146216370326', 3),
            ('705780146216370326', 4),
            ('705780146216370326', 5),
            ('705780146216370326', 6),
            ('705780146216370326', 7)
    */
   await G.addLeaderboards([V, LW, CCG, CCB, B71, BB, NM]);
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

const logModelAssociations = async (models) => {
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

module.exports = {
    connect,
    sync,
    syncGuilds,
    logModelAssociations,
};