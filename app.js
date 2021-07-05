/* eslint-disable no-console */
require('dotenv').config();
const { App, ExpressReceiver, LogLevel } = require('@slack/bolt');
const mongoose = require('mongoose');
const AdminBro = require('admin-bro');
const options = require('./admin/admin.options');
const buildAdminRouter = require('./admin/admin.router');
const ReservationController = require('./controllers/reservation.controllers');
const UserController = require('./controllers/user.controller');
const { scopes } = require('./utils/scopes');
const {
  storeInstallation,
  fetchInstallation,
} = require('./controllers/auth.controller');

const PORT = process.env.PORT || 4000;

const adminBro = new AdminBro(options);
const router = buildAdminRouter(adminBro);

// Create a Bolt Receiver
const receiver = new ExpressReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  clientId: process.env.SLACK_CLIENT_ID,
  clientSecret: process.env.SLACK_CLIENT_SECRET,
  token: process.env.SLACK_BOT_TOKEN,
  stateSecret: process.env.SLACK_STATE_SECRET,
  logLevel: LogLevel.DEBUG,
  scopes,
  installationStore: {
    storeInstallation,
    fetchInstallation,
  },
});

// Create the Bolt App, using the receiver
const app = new App({
  receiver,
});

app.command('/yoyaku-list', ReservationController.listReservationByDate);
app.command('/yoyaku', ReservationController.addReservation);
app.view('add_reserve', ReservationController.submitReserve);

// When a user joins the team, is added to yoyaku
app.event('team_join', UserController.registerUser);

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
    console.log('el error', e);
  }
})();

module.exports = app;
