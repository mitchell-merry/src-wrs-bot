import pkg from "sequelize";
const { DataTypes, Model } = pkg;

export default class TrackedLeaderboard extends Model {
    static init(sequelize) {
        return super.init({
            /*
                CREATE TABLE IF NOT EXISTS TrackedLeaderboard (
                    guild_id TEXT NOT NULL REFERENCES Guild (guild_id),
                    lb_id INT NOT NULL REFERENCES Leaderboard (lb_id),
                    PRIMARY KEY (guild_id, lb_id)
                )
            */

            guild_id: {
                field: "guild_id",
                primaryKey: true,
                type: DataTypes.STRING,
                allowNull: false,
                autoIncrement: false,
            },
            lb_id: {
                field: "lb_id",
                primaryKey: true,
                type: DataTypes.STRING,
                allowNull: false,
                autoIncrement: false,
            },
        }, {
            tableName: "TrackedLeaderboard",
            underscored: true,
            freezeTableName: true,
            timestamps: false,
            sequelize
        });
    }

    static associate(models) {
        this.belongsTo(models.Leaderboard, {
            foreignKey: "lb_id",
            targetKey: "lb_id"
        });
        this.belongsTo(models.Guild, {
            foreignKey: "guild_id",
            targetKey: "guild_id"
        });
    }
}