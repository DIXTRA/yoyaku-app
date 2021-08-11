/* eslint-disable no-console */
const AdminBro = require('admin-bro');
const MongoStore = require('connect-mongo').default;

const { buildAuthenticatedRouter } = require('@admin-bro/express');
const { User } = require('../entities/user.entities');
/**
 *
 * @param {AdminBro} admin
 * @return {Express.Router} router
 */
const buildAdminRouter = (admin) => {
  const router = buildAuthenticatedRouter(
    admin,
    {
      cookieName: process.env.COOKIE_NAME || 'dev-adminpanel',
      cookiePassword: process.env.COOKIE_PASSWORD || 'Admin123$',
      authenticate: async (email, password) => {
        if (!email || !password) return null;

        try {
          const user = await User.findOne({ email });
          const { encryptedPassword, role } = (user || {});

          if (role > 0 && encryptedPassword) {
            const passwordIsValid = await user.validPassword(password, encryptedPassword);
            if (passwordIsValid) {
              return user;
            }
          }

          return null;
        } catch (error) {
          console.error('Error <admin.router/authenticate>: ', error);
          return null;
        }
      },
    },
    null,
    {
      resave: false,
      saveUninitialized: true,
      session: MongoStore.create({ mongoUrl: process.env.MONGODB_URL }),
    },
  );
  return router;
};

module.exports = buildAdminRouter;
