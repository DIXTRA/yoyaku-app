/* eslint-disable no-console */
const { App, ExpressReceiver } = require('@slack/bolt');
const mongoose = require('mongoose');
const AdminBro = require('admin-bro');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const createError = require('http-errors');
const path = require('path');
const options = require('./admin/admin.options');
const buildAdminRouter = require('./admin/admin.router');
require('dotenv').config();

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

app.message('hello', async ({ message, say }) => {
  // say() sends a message to the channel where the event was triggered
  await say(`Hey there <@${message.user}>!`);
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
    console.log('⚡️ Bolt app is running!');
  } catch (e) {
    console.log(e);
  }
})();

module.exports = app;
