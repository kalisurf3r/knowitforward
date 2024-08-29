const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/connection");

class UserProfile extends Model { }

UserProfile.init(
    {
    },
    {
        sequelize
    }
);

module.exports = UserProfile;