const AdminBro = require("admin-bro");
const { buildRouter } = require("@admin-bro/express");

/**
 *
 * @param {AdminBro} admin
 * @return {Express.Router} router
 */
const buildAdminRouter = (admin) => {
  const router = buildRouter(admin);
  return router;
};

module.exports = buildAdminRouter;
