const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/connection");

class CharityToUser extends Model { }

CharityToUser.init(
    {
        CharityId: {
            type: DataTypes.INTEGER,
            unique: true,
            allowNull: false
        },
        UserId: {
            type: DataTypes.INTEGER,
            unique: true,
            allowNull: false
        }
    },
    {
        sequelize
    }
);

module.exports = CharityToUser;