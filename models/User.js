const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/connection");

class User extends Model { }

User.init(
    {
        firstName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        lastName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        aboutMe: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false
        },
        ratings: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        profession: {
            type: DataTypes.STRING,
            allowNull: true
        },
        profileImgUrl: {
            type: DataTypes.STRING,
            allowNull: true
        }
    },
    {
        sequelize
    }
);

module.exports = User;