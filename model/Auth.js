const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/connection");

class Auth extends Model { }

Auth.init(
    {
    },
    {
        sequelize
    }
);

module.exports = Auth;