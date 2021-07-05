const { Auth } = require('../entities/auth.entities');

const storeInstallation = async (installation) => {
  if (installation.team !== undefined) {
    const createAuth = await Auth.create({
      slackId: installation.team.id,
      slackData: installation,
    });
    return createAuth;
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

module.exports = { storeInstallation, fetchInstallation };
