const { DataTypes, Model } = require("sequelize");

class User extends Model {
    static init(sequelize) {
        /*
            CREATE TABLE IF NOT EXISTS User (
                user_id TEXT NOT NULL PRIMARY KEY,
                src_username TEXT NOT NULL,
                discord_id TEXT
            )
        */

        return super.init({
            user_id: {
                field: "user_id",
                primaryKey: true,
                type: DataTypes.STRING,
                allowNull: false,
                autoIncrement: false,
            },
            src_username: {
                field: "src_username",
                type: DataTypes.STRING
            },
            discord_id: {
                field: "discord_id",
                type: DataTypes.STRING
            }
        }, {
            tableName: "User",
            underscored: true,
            freezeTableName: true,
            sequelize
        });
    }

    static associate(models) {
        this.hasMany(models.Leaderboard, {
            foreignKey: "wr_holder_id", 
            sourceKey: "user_id", 
            as: "WRHolder"
        });

    }
}

module.exports = User;