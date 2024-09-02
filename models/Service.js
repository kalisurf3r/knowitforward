const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/connection");

class Service extends Model { }

Service.init(
    {
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        basePrice: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        serviceDate: {
            type: DataTypes.DATE,
            allowNull: false
        },
        status: {
            type: DataTypes.STRING,
            allowNull: false
        },
        offerEndDate: {
            type: DataTypes.DATE,
            allowNull: false
        },
        paymentLink: {
            type: DataTypes.STRING,
            allowNull: true
        }
    },
    {
        sequelize
    }
);

module.exports = Service;