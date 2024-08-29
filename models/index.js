const Auth = require("./Auth");
const Category = require("./Category");
const Charity = require("./Charity");
const CharityToUser = require("./CharityToUser");
const Service = require("./Service");
const User = require("./User");

// user belongs to many charities
User.belongsToMany(Charity, { through: CharityToUser });
//charities can have many users
Charity.belongsToMany(User, { through: CharityToUser });

// service belongs to a category
Service.belongsTo(Category);
// cateogry can have many services associated to it 
Category.hasMany(Service);

// service belogns to a charity
Service.belongsTo(Charity);
// charity can have many services associated to it
Charity.hasMany(Service);

// service has one service provider identified by foreing key ServiceProviderId
Service.belongsTo(User, { as: "ServiceProvider", foreignKey: 'ServiceProviderId' });
// service has one custoemr identified by foreign key CustomerId
Service.belongsTo(User, { as: 'Customer', foreignKey: 'CustomerId' });

// User has many services where they are  the service provider id identified by ServiceProviderId
User.hasMany(Service, { as: "ServicesProvided", foreignKey: "ServiceProviderId" });
// User has many services where they are the customer identified by Customer Id.
User.hasMany(Service, { as: "ServicesBooked", foreignKey: "CustomerId" })

// The A.hasOne(B) association means that a One-To-One relationship exists between A and B, with the foreign key being defined in the target model (B).
// The A.belongsTo(B) association means that a One-To-One relationship exists between A and B, with the foreign key being defined in the source model (A).

User.hasOne(Auth, {
    onDelete: "CASCADE",
}); //user foreign key defined in auth
Auth.belongsTo(User);

module.exports = {
    Auth,
    Category,
    Charity,
    CharityToUser,
    Service,
    User
};