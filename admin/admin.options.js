const AdminBro = require("admin-bro");
const AdminBroMongoose = require("@admin-bro/mongoose");

AdminBro.registerAdapter(AdminBroMongoose);

const { User } = require("../entities/user.entity");

/** @type {AdminBro.AdminBroOptions} */

const options = {
  resources: [User],
};

module.exports = options;
