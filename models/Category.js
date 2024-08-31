const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/connection");

class Category extends Model { }

Category.init(
    {
        categoryName: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
    },
    {
        sequelize
    }
);

module.exports = Category;