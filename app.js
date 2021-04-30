/* eslint-disable no-console */
const { App, ExpressReceiver } = require("@slack/bolt");
const mongoose = require("mongoose");
const AdminBro = require("admin-bro");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const createError = require("http-errors");
const path = require("path");
const options = require("./admin/admin.options");
const buildAdminRouter = require("./admin/admin.router");
const reserve = require("./components/reserve");
const { throws } = require("assert");
require("dotenv").config();

const PORT = process.env.PORT || 4000;
const adminBro = new AdminBro(options);
const router = buildAdminRouter(adminBro);

// Create a Bolt Receiver
const receiver = new ExpressReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

// Create the Bolt App, using the receiver
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  receiver,
});

// Slack interactions are methods on app

app.command("/reserve", async ({ ack, body, client }) => {
  await ack();

  const modal = reserve;
  modal.trigger_id = body.trigger_id;

  try {
    await client.views.open(modal);
  } catch (error) {
    console.error(error);
  }
});

app.view("reserve", async ({ ack, body, view, client }) => {
  await ack();

  const form = view.state.values;
  const user = body.user.id;

  const reservationInfo = {
    date: form.date_input["datepicker-action"].selected_date,
    room: form.site_input["static_select-action"].selected_option.value,
    user,
  };

  try {
  } catch (e) {
    console.log(e);
  }
});

// Other web requests are methods on receiver.router
receiver.router.use(adminBro.options.rootPath, router);

// // view engine setup
// app.set("views", path.join(__dirname, "views"));
// app.set("view engine", "jade");

// app.use(logger("dev"));
// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));
// app.use(cookieParser());
// app.use(express.static(path.join(__dirname, "public")));

// app.use("/", indexRouter);
// app.use("/users", usersRouter);

// // catch 404 and forward to error handler
// app.use((req, res, next) => {
//   next(createError(404));
// });

// // error handler
// app.use((err, req, res, next) => {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get("env") === "development" ? err : {};

//   // render the error page
//   res.status(err.status || 500);
//   res.render("error");
// });

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true,
    });
    await app.start(PORT);
    console.log("⚡️ Bolt app is running!");
  } catch (e) {
    console.log(e);
  }
})();

module.exports = app;
