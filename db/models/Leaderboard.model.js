const { DataTypes, Model } = require("sequelize");

class Leaderboard extends Model {
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
            },
            wr_run_id: {
                field: "category_id",
                type: DataTypes.STRING,
            }
        }, {
            tableName: "Leaderboard",
            sequelize
        });
    }

    static associate(models) {
        //this.hasMany(models.OtherModel);
    }
}

module.exports = Leaderboard;