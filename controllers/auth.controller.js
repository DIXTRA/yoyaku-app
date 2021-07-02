const { WebClient, LogLevel } = require('@slack/web-api');
const { Auth } = require('../entities/auth.entities');
const { Team } = require('../entities/team.entities');
const { saveTeam } = require('./team.controller');
const { saveUsers } = require('./user.controller');

const storeInstallation = async (installation) => {
  if (installation.team !== undefined) {
    let newAuth;
    const existAuth = await Auth.findOneAndReplace(
      {
        slackId: installation.team.id,
      },
      {
        slackId: installation.team.id,
        slackData: installation,
      },
      { new: true },
    );

    if (existAuth) {
      newAuth = existAuth;
    } else {
      const createAuth = await Auth.create({
        slackId: installation.team.id,
        slackData: installation,
      });
      newAuth = createAuth;
    }

    return newAuth;
  }
  throw new Error('Failed saving installation data to installationStore');
};

const fetchInstallation = async (installQuery) => {
  if (installQuery.teamId !== undefined) {
    const getAuth = await Auth.findOne({ slackId: installQuery.teamId });
    return getAuth.slackData;
  }
  throw new Error('Failed fetching installation');
};

const intializeApp = async (installation, installOptions, req, res) => {
  try {
    const teamIsAlreadyConfigured = await Team.findOne({
      slackId: installation.team.id,
    });

    if (teamIsAlreadyConfigured) {
      return res.send('Slack setup successfully');
    }

    const client = new WebClient(installation.bot.token, {
      // LogLevel can be imported and used to make debugging simpler
      logLevel: LogLevel.DEBUG,
    });

    const result = await client.users.list();

    await saveTeam(
      installation.team,
      client,
      installation.incomingWebhook.channelId,
    );

    await saveUsers(
      result.members,
      client,
      installation.incomingWebhook.channelId,
    );
    res.send('Slack setup successfully');
  } catch (err) {
    res.send('Slack failure');
  }
};

module.exports = { storeInstallation, fetchInstallation, intializeApp };
