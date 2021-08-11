/**
 * Required because AdminBro can't reference correctly Team from User
 * https://github.com/SoftwareBrothers/adminjs/issues/828
* */

const { Team } = require('./team.entities');

const options = {
  properties: {
    name: {
      isTitle: true,
      isRequired: true,
    },
    slackId: {
      isRequired: true,
      isDisabled: true,
    },
  },
  listProperties: ['name', 'offices', 'icon'],
  showProperties: ['name', 'offices', 'icon'],
  editProperties: ['name', 'offices', 'icon'],
  filterProperties: ['name', 'offices', 'icon'],
};

module.exports = {
  resource: Team,
  options,
};
