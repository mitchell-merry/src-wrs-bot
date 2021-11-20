import pkg from "sequelize";
const { DataTypes, Model } = pkg;

export default class Leaderboard extends Model {
    static init(sequelize) {
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

        this.TrackedLeaderboards = this.hasMany(models.TrackedLeaderboard, {
            foreignKey: "lb_id",
            sourceKey: "lb_id"
        });

        this.Guilds = this.belongsToMany(models.Guild, {
            through: models.TrackedLeaderboard,
            foreignKey: "lb_id",
            otherKey: "guild_id"
        });

        this.Variables = this.hasMany(models.Variable, {
            foreignKey: "lb_id",
            sourceKey: "lb_id"
        });
    }
}