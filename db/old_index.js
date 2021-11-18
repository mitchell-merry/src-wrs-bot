var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('database.sqlite');

const TESTING = true;

// Initialise all schemas. Needs to run in serial.
const initialise_schemas = () => {
    db.serialize(() => {
        if(TESTING) {
            db.run('DROP TABLE IF EXISTS Guild;');
            db.run('DROP TABLE IF EXISTS User;');
            db.run('DROP TABLE IF EXISTS Leaderboard;');
            db.run('DROP TABLE IF EXISTS LeaderboardVariable;');
            db.run('DROP TABLE IF EXISTS TrackedLeaderboard;');
        }

        // Guild - discord server.
        db.run(`CREATE TABLE IF NOT EXISTS Guild (
            guild_id TEXT NOT NULL PRIMARY KEY,
            wr_message_id TEXT,
            wr_role_color INT
        )`);

        // User - associating a speedrun.com account to a discord account
        // (if discord_id is null then the account is unassociated)
        db.run(`CREATE TABLE IF NOT EXISTS User (
            user_id TEXT NOT NULL PRIMARY KEY,
            src_username TEXT NOT NULL,
            discord_id TEXT
        )`);
        
        // Leaderboard - each leaderboard (game/category/variable) and its data. To be tracked by guilds.
        db.run(`CREATE TABLE IF NOT EXISTS Leaderboard (
            lb_id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
            game_id TEXT NOT NULL,
            category_id TEXT NOT NULL,
            wr_holder_id TEXT REFERENCES User (user_id),
            wr_run_id TEXT
        )`);

        // LeaderboardVariable - Defining the variables for each leaderboard (subcategories)
        db.run(`CREATE TABLE IF NOT EXISTS LeaderboardVariable (
            lb_id INTEGER NOT NULL REFERENCES Leaderboard (lb_id),
            variable_id TEXT NOT NULL,
            value TEXT NOT NULL,
            PRIMARY KEY (lb_id, variable_id)
        )`);

        // TrackedLeaderboard - which guilds track which leaderboards?
        db.run(`CREATE TABLE IF NOT EXISTS TrackedLeaderboard (
            guild_id TEXT NOT NULL REFERENCES Guild (guild_id),
            lb_id INT NOT NULL REFERENCES Leaderboard (lb_id),
            PRIMARY KEY (guild_id, lb_id)
        )`);

        // Fill with dummy data
        if(TESTING) {
            // Bot Testing
            db.run("INSERT INTO Guild (guild_id, wr_role_color) VALUES ('705780146216370326', 15844367);");

            // dummy data
            // db.run(`INSERT INTO User VALUES
            //     ('qjoz6gn8', 'diggity', '270856336466509835'),
            //     ('8en3o968', 'MildGothDaddy', '349773873031413761'),
            //     ('8vogmevx', 'PleasantlyGG', '544510397042917395'),
            //     ('jop6zmex', 'Zomb_Slays', '440320868783226890');
            // `);
            
            // Bot IDs to stand in
            db.run(`INSERT INTO User VALUES
                ('qjoz6gn8', 'diggity', '270856336466509835'),
                ('8en3o968', 'MildGothDaddy', '234395307759108106'),
                ('8vogmevx', 'PleasantlyGG', '339254240012664832'),
                ('jop6zmex', 'Zomb_Slays', '705780864549650493');
            `);

            /*
                Veneficium Any% (Mild)
                Late Work Any% (Diggity)
                Cultists & Compounds Good% (Zomb) 
                Cultists & Compounds Bad% (Mild)
                The Building 71 Incident Any% (Zomb)
                Blackberry Any% (Pleasant)
                Nun Massacre Any% - Glitchess (Zomb)

                Gibberish
            */
            db.run(`INSERT INTO Leaderboard (game_id, category_id, wr_holder_id, wr_run_id) VALUES
                ('m1zj9r06', 'wkp9pl02', '8en3o968', 'ylrkqdny'),
                ('m1mnepkd', 'n2yvqne2', 'qjoz6gn8', 'm37dpn4z'),
                ('j1lq9qz6', '7dgmx0pd', 'jop6zmex', 'mrnvp84y'),
                ('j1lq9qz6', 'mkexvl6d', '8en3o968', 'z1xg8wrm'),
                ('y6550w36', 'jdrr8jnd', 'jop6zmex', 'y27w1r6z'),
                ('9do88le1', 'wk60q8rk', '8vogmevx', 'm37w78wz'),
                ('y654kg7d', 'xd1l9xrk', 'jop6zmex', 'zp8k75xy');
            `);

            // Nun Massacre Any% - Glitchess
            db.run(`INSERT INTO LeaderboardVariable (lb_id, variable_id, value) VALUES
                (7, 'ylqkj9ml', 'zqorkrpq')
            `);

            // Guild tracks all of these leaderboards
            db.run(`INSERT INTO TrackedLeaderboard VALUES
                ('705780146216370326', 1),
                ('705780146216370326', 2),
                ('705780146216370326', 3),
                ('705780146216370326', 4),
                ('705780146216370326', 5),
                ('705780146216370326', 6),
                ('705780146216370326', 7)
            `);
        }
    });
}

const get_leaderboard_object = (lb_id) => {
    db.serialize(() => {
        db.get(
            `SELECT game_id, category_id, wr_holder_id, wr_run_id FROM Leaderboard WHERE lb_id = $id;`, 
            { $id: lb_id },
            (err, row) => {
                console.log(row);
            }
        );

        db.all(
            `SELECT variable_id, value FROM LeaderboardVariable WHERE lb_id = $id;`, 
            { $id: lb_id },
            (err, rows) => {
                console.log(rows);
            }
        );
    })

    // // console.log(Leaderboard)
    // console.log(LeaderboardVariables)
}

module.exports = { 
    initialise_schemas,
    get_leaderboard_object
}