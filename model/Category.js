const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/connection");

class Category extends Model { }

Category.init(
    {
    },
    {
        sequelize
    }
);

module.exports = Category;