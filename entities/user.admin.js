const AdminBro = require("admin-bro");

const {
  before: passwordBeforeHook,
  after: passwordAfterHook,
} = require("../actions/password.hook");
const { User } = require("./user.entity");

/** @type {AdminBro.ResourceOptions} */
const options = {
  properties: {
    encryptedPassword: {
      isVisible: false,
    },
    password: {
      type: "password",
    },
  },
  actions: {
    new: {
      before: passwordBeforeHook,
      after: passwordAfterHook,
    },
    edit: {
      before: passwordBeforeHook,
      after: passwordAfterHook,
    },
  },
};

module.exports = {
  options,
  resource: User,
};
