var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('database.sqlite');

// Initialise all schemas. Needs to run in serial.
const initialiseSchemas = () => {
    db.serialize(() => {
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
        )`)
    })
}

module.exports = { initialiseSchemas }