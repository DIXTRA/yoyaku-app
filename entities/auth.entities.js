const mongoose = require('mongoose');

const { Schema, model } = mongoose;

const AuthSchema = new Schema({
  slackId: { type: String },
  slackData: {
    team: {
      id: { type: String },
      name: { type: String },
    },
    enterprise: { type: String },
    user: {
      token: { type: String },
      scopes: { type: String },
      id: { type: String },
    },
    tokenType: { type: String },
    isEnterpriseInstall: { type: Boolean },
    appId: { type: String },
    authVersion: { type: String },
    bot: {
      scopes: [String],
      token: { type: String },
      userId: { type: String },
      id: { type: String },
    },
    incomingWebhook: {
      url: { type: String },
      channel: { type: String },
      channelId: { type: String },
      configurationUrl: { type: String },
    },
  },
});

const Auth = model('Auth', AuthSchema);

module.exports = { AuthSchema, Auth };
