const AdminBro = require("admin-bro");
const session = require("express-session");
const MongoStore = require("connect-mongo").default;

const { buildAuthenticatedRouter } = require("@admin-bro/express");
const { User } = require("../entities/user.entity");
/**
 *
 * @param {AdminBro} admin
 * @return {Express.Router} router
 */
const buildAdminRouter = (admin) => {
  const router = buildAuthenticatedRouter(
    admin,
    {
      cookieName: process.env.COOKIE_NAME || "dev-adminpanel",
      cookiePassword: process.env.COOKIE_PASSWORD || "Admin123$",
      authenticate: async (email, password) => {
        const user = await User.findOne({ email });
        if (user && user.validPassword(password)) {
          console.log('user', user)
          return user.toJSON();
        }
        console.log('null ', user)
        return null;
      },
    },
    null,
    {
      resave: false,
      saveUninitialized: true,
      session: MongoStore.create({ mongoUrl: process.env.MONGODB_URL }),
    }
  );
  return router;
};

module.exports = buildAdminRouter;
