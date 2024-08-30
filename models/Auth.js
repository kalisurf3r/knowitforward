const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/connection");
const bcrypt = require("bcrypt");

class Auth extends Model { }

Auth.init(
    {
        username: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isAlphanumeric: true
            },
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: [8],
            },
        },
        UserId: {
            type: DataTypes.INTEGER,
            unique: true, // Ensure this is unique
        },
    },
    {
        sequelize,
        // Hash the pwd before saving in db.
        hooks: {
            beforeCreate: (userObj) => {
                userObj.password = bcrypt.hashSync(userObj.password, 6);
                return userObj;
            },
        },
    }
);

module.exports = Auth;