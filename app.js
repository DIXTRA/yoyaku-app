const createError = require("http-errors");
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const AdminBro = require("admin-bro");

const app = express();
const PORT = process.env.PORT || 4000;

require("dotenv").config();

const options = require("./admin/admin.options");
const buildAdminRouter = require("./admin/admin.router");

const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");

const run = async () => {
  const connection = await mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const adminBro = new AdminBro(options);
  const router = buildAdminRouter(adminBro);
  app.use(adminBro.options.rootPath, router);
  
  // view engine setup
  app.set("views", path.join(__dirname, "views"));
  app.set("view engine", "jade");

  app.use(logger("dev"));
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(cookieParser());
  app.use(express.static(path.join(__dirname, "public")));

  app.use("/", indexRouter);
  app.use("/users", usersRouter);

  // catch 404 and forward to error handler
  app.use((req, res, next) => {
    next(createError(404));
  });

  // error handler
  app.use((err, req, res, next) => {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render("error");
  });

  app.listen(PORT, () => {
    console.log(`Listening to app at http://locahost:${PORT}`);
  });
};

run();

module.exports = app;
