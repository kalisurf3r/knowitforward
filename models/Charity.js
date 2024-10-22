const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/connection");

class Charity extends Model { }

Charity.init(
    {
        charityName: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        charityDesc: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        wallet: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        logoImgUrl: {
            type: DataTypes.STRING,
            allowNull: true
        },
        websiteUrl: {
            type: DataTypes.STRING,
            allowNull: false
        }

    },
    {
        sequelize
    }
);

module.exports = Charity;