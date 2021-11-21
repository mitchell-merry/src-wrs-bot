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
            role_default_color: {
                field: "role_default_color",
                type: DataTypes.STRING,
            },
            track_sum: {
                field: "track_sum",
                type: DataTypes.BOOLEAN,
            },
            // display: {
            //     field: "display",
            //     type: DataTypes.ENUM('normal', 'embed', 'code_block')
            // }
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