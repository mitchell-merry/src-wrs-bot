import pkg from "sequelize";
const { DataTypes, Model } = pkg;

export default class Player extends Model {
    static init(sequelize) {
        return super.init({
            player_id: {
                field: "player_id",
                primaryKey: true,
                type: DataTypes.STRING,
                allowNull: false,
                autoIncrement: false,
            },
            discord_id: {
                field: "discord_id",
                type: DataTypes.STRING
            }
        }, {
            tableName: "Player",
            underscored: true,
            freezeTableName: true,
            timestamps: false,
            sequelize
        });
    }

    static associate(models) {

    }
}