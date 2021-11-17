const { DataTypes, Model } = require("sequelize");

class User extends Model {
    static init(sequelize) {
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
            sequelize
        });
    }

    static associate(models) {
        //this.hasMany(models.OtherModel);
        // this.belongsTo(models.Guild, { foreignKey: "" });
    }
}

module.exports = User;