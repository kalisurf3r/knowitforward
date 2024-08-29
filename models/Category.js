const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/connection");

class Category extends Model { }

Category.init(
    {
        categoryName: {
            type: DataTypes.STRING,
            allowNull: false
        },
    },
    {
        sequelize
    }
);

module.exports = Category;