import pkg from "sequelize";
import config from "../../config";
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
        this.models = models;

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

    static getWithLeaderboards(guild_id) {
        const { Leaderboard, Variable } = config.sequelize.models;

        return Guild.findByPk(guild_id, {
            include: {
                model: Leaderboard,
                through: { attributes: [ 'role_id' ] },
                include: [{ 
                    model: Variable,
                    attributes: { exclude: ['lb_id'] }
                }]
            },
        }).then(G => {
            const guild = { ...G.dataValues };

            guild.Leaderboards = G.dataValues.Leaderboards.map(lb => {
                const { Variables, TrackedLeaderboard, ...data } = lb.dataValues;
                
                return { ...data, ...TrackedLeaderboard.dataValues,
                    Variables: Variables.map(v => v.dataValues), 
                };
            })
            
            return guild;
        });
    }
}