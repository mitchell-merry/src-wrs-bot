// const { DataTypes, Model } = require("sequelize");

// class TrackedLeaderboard extends Model {
//     static init(sequelize) {
//         return super.init({
//             guild_id: {
//                 field: "guild_id",
//                 primaryKey: true,
//                 type: DataTypes.STRING,
//                 allowNull: false,
//                 autoIncrement: false,
//             },
//             lb_id: {
//                 field: "lb_id",
//                 primaryKey: true,
//                 type: DataTypes.STRING,
//                 allowNull: false,
//                 autoIncrement: false,
//             },
//         }, {
//             tableName: "TrackedLeaderboard",
//             sequelize
//         });
//     }

//     static associate(models) {
//         //this.hasMany(models.OtherModel);
//     }
// }

// module.exports = TrackedLeaderboard;