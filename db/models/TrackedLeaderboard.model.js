import pkg from "sequelize";
const { DataTypes, Model } = pkg;

export default class TrackedLeaderboard extends Model {
    static init(sequelize) {
        return super.init({
            
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
            role_id: {
                field: "role_id",
                type: DataTypes.STRING
            }
        }, {
            tableName: "TrackedLeaderboard",
            underscored: true,
            freezeTableName: true,
            timestamps: false,
            sequelize
        });
    }

    static associate(models) {
        this.Leaderboard = this.belongsTo(models.Leaderboard, {
            foreignKey: "lb_id",
            targetKey: "lb_id"
        });

        this.Guild = this.belongsTo(models.Guild, {
            foreignKey: "guild_id",
            targetKey: "guild_id"
        });
    }
}