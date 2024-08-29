const sequelize = require('../config/connection');
const {
    Auth,
    Category,
    Charity,
    CharityToUser,
    Service,
    User
} = require('../models');


const userSeed = require('./user.json');
const authSeed = require('./auth.json');
const charitySeed = require('./charity.json');
const charityToUserSeed = require('./charitytouser.json');
const categorySeed = require('./category.json');
const serviceSeed = require('./service.json')

const seedDatabase = async () => {
    await sequelize.sync({ force: true });
    await User.bulkCreate(userSeed, { individualHooks: true });
    await Auth.bulkCreate(authSeed);
    await Charity.bulkCreate(charitySeed);
    await CharityToUser.bulkCreate(charityToUserSeed);
    await Category.bulkCreate(categorySeed);
    await Service.bulkCreate(serviceSeed);
    process.exit(0);
};

seedDatabase();