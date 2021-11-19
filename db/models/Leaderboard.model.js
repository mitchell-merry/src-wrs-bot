const { DataTypes, Model } = require("sequelize");

class Leaderboard extends Model {
    static init(sequelize) {
        /*
            CREATE TABLE IF NOT EXISTS Leaderboard (
                lb_id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
                game_id TEXT NOT NULL,
                category_id TEXT NOT NULL,
                wr_holder_id TEXT REFERENCES User (user_id),
                wr_run_id TEXT
            )
        */

        return super.init({
            lb_id: {
                field: "lb_id",
                primaryKey: true,
                type: DataTypes.INTEGER,
                allowNull: false,
                autoIncrement: true,
            },
            game_id: {
                field: "game_id",
                type: DataTypes.STRING,
            },
            category_id: {
                field: "category_id",
                type: DataTypes.STRING,
            },
            wr_holder_id: {
                field: "wr_holder_id",
                type: DataTypes.STRING
            },
            wr_run_id: {
                field: "wr_run_id",
                type: DataTypes.STRING,
            }
        }, {
            tableName: "Leaderboard",
            underscored: true,
            freezeTableName: true,
            timestamps: false,
            sequelize
        });
    }

    static associate(models) {
        this.belongsTo(models.User, { 
            foreignKey: "wr_holder_id", 
            targetKey: "user_id",
            as: "WRHolder"
        });

        this.hasMany(models.TrackedLeaderboard, {
            foreignKey: "lb_id",
            sourceKey: "lb_id"
        });
        this.belongsToMany(models.Guild, {
            through: models.TrackedLeaderboard,
            foreignKey: "lb_id",
            otherKey: "guild_id"
        });

        this.hasMany(models.Variable, {
            foreignKey: "lb_id",
            sourceKey: "lb_id"
        });
    }
}

module.exports = Leaderboard;