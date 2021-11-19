import pkg from "sequelize";
const { DataTypes, Model } = pkg;

export default class Guild extends Model {
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
            underscored: true,
            freezeTableName: true,
            timestamps: false,
            sequelize
        });
    }

    static associate(models) {
        this.hasMany(models.TrackedLeaderboard, {
            foreignKey: "guild_id",
            targetKey: "guild_id",
            as: "Guild"
        });
        this.belongsToMany(models.Leaderboard, {
            through: models.TrackedLeaderboard,
            foreignKey: "guild_id",
            otherKey: "lb_id"
        });
    }
}