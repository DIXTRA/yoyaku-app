const {
  before: passwordBeforeHook,
  after: passwordAfterHook,
} = require('../actions/password.hook');
const { User } = require('./user.entities');

/** @type {AdminBro.ResourceOptions} */
const options = {
  properties: {
    encryptedPassword: {
      isVisible: false,
    },
    password: {
      type: 'password',
    },
    email: {
      isTitle: true,
    },
    slackId: {
      isVisible: false,
    },
    role: {
      isVisible: false,
    },
  },
  listProperties: ['email', 'firstName', 'lastName'],
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
