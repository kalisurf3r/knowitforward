const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/connection");

class CharityToUser extends Model { }

CharityToUser.init(
    {
    },
    {
        sequelize
    }
);

module.exports = CharityToUser;