const express = require('express');
const AdminBro = require('admin-bro');
const mongoose = require('mongoose');
const { createEventAdapter } = require('@slack/events-api');
const { createMessageAdapter } = require('@slack/interactive-messages');
const { WebClient } = require('@slack/web-api');
const buildAdminRouter = require('./admin/admin.router');
const options = require('./admin/admin.options');
require('dotenv').config();

const port = process.env.PORT || 4000;
const adminBro = new AdminBro(options);
const router = buildAdminRouter(adminBro);
const app = express();
const token = process.env.SLACK_BOT_TOKEN;
const webClient = new WebClient(token);

const slackEvents = createEventAdapter(process.env.SLACK_SIGNING_SECRET);
const slackInteractions = createMessageAdapter(process.env.SLACK_SIGNING_SECRET);

app.use(adminBro.options.rootPath, router);
app.use('/slack/events', slackEvents.expressMiddleware());
app.use('/slack/actions', slackInteractions.expressMiddleware());

app.use(express.json());

slackEvents.on('message', async (event) => {
  console.log(`Received a message event: user ${event.user} in channel ${event.channel} says ${event.text}`);
});

// Starts server
app.listen(port, async () => {
  await mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log(`Server is listening on port ${port}`);
});

module.exports = app;
