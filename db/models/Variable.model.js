import pkg from "sequelize";
const { DataTypes, Model } = pkg;

export default class Variable extends Model {
    static init(sequelize) {
        return super.init({
            lb_id: {
                field: "lb_id",
                primaryKey: true,
                type: DataTypes.STRING,
                allowNull: false,
                autoIncrement: false,
            },
            variable_id: {
                field: "variable_id",
                primaryKey: true,
                type: DataTypes.STRING,
                allowNull: false
            },
            value: {
                field: "value",
                type: DataTypes.STRING,
                allowNull: false
            }
        }, {
            tableName: "Variable",
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
    }
}