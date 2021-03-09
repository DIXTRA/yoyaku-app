const AdminBro = require("admin-bro");
const AdminBroMongoose = require("@admin-bro/mongoose");

AdminBro.registerAdapter(AdminBroMongoose);

const AdminUser = require("../entities/user.admin");

/** @type {AdminBro.AdminBroOptions} */

const options = {
  resources: [AdminUser],
};

module.exports = options;
