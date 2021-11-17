const { DataTypes, Model } = require("sequelize");

class Guild extends Model {
    static init(sequelize) {
        /*
            CREATE TABLE IF NOT EXISTS Guild (
                guild_id TEXT NOT NULL PRIMARY KEY,
                wr_message_id TEXT,
                wr_role_color INT
            )
        */
        
        return super.init({
            guild_id: {
                field: "guild_id",
                primaryKey: true,
                type: DataTypes.STRING,
                allowNull: false,
                autoIncrement: false,
            },
            wr_message_id: {
                field: "wr_message_id",
                type: DataTypes.STRING,
            },
            wr_role_color: {
                field: "wr_role_color",
                type: DataTypes.STRING,
            }
        }, {
            tableName: "Guild",
            sequelize
        });
    }

    static associate(models) {
        this.hasMany(models.TrackedLeaderboard);
    }
}

module.exports = Guild;