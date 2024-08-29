const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/connection");

class Charity extends Model { }

Charity.init(
    {
    },
    {
        sequelize
    }
);

module.exports = Charity;