const AdminBro = require("admin-bro");
const bcrypt = require("bcrypt-nodejs");

/** @type {AdminBro.Before} */
const before = async (request) => {
  if (request.method === "post") {
    const { password, ...otherParams } = request.payload;

    if (password) {
      const encryptedPassword = bcrypt.hashSync(
        password,
        bcrypt.genSaltSync(8),
        null
      );

      return {
        ...request,
        payload: {
          ...otherParams,
          encryptedPassword,
        },
      };
    }
  }
};

/** @type {AdminBro.After<AdminBro.ActionResponse} */
const after = async (response) => {
  if (response.record && response.record.errors) {
    response.record.errors.password = response.record.errors.encryptedPassword;
  }
  return response;
};

module.exports = { before, after };
