import pkg from "sequelize";
const { DataTypes, Model } = pkg;

export default class Guild extends Model {
    static init(sequelize) {
        
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
            hoisted_role_id: {
                field: "hoisted_role_id",
                type: DataTypes.STRING,
            },
            wr_role_color: {
                field: "wr_role_color",
                type: DataTypes.INTEGER,
            },
            track_sum: {
                field: "track_sum",
                type: DataTypes.BOOLEAN,
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
        this.TrackedLeaderboards = this.hasMany(models.TrackedLeaderboard, {
            foreignKey: "guild_id",
            targetKey: "guild_id",
        });

        this.Leaderboards = this.belongsToMany(models.Leaderboard, {
            through: models.TrackedLeaderboard,
            foreignKey: "guild_id",
            otherKey: "lb_id"
        });
    }
}