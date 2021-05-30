const AdminBro = require('admin-bro');
const AdminBroMongoose = require('@admin-bro/mongoose');

AdminBro.registerAdapter(AdminBroMongoose);

const AdminUser = require('../entities/user.admin');
const AdminOffice = require('../entities/office.admin');
const AdminRoom = require('../entities/room.admin');

/** @type {AdminBro.AdminBroOptions} */

const options = {
  resources: [AdminUser, AdminOffice, AdminRoom],
  branding: {
    companyName: 'Yoyaku Admin',
  },
};

module.exports = options;
