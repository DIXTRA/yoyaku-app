const { Team } = require('../entities/team.entities');
const { createDefaultOffice } = require('./office.controller');
const { createDefaultRoom } = require('./room.controller');

const saveTeam = async (_team) => {
  try {
    const defaultRoom = await createDefaultRoom(_team.name);
    const defaultOffice = await createDefaultOffice(
      _team.name,
      defaultRoom._id,
    );

    const team = await Team.create({
      slackId: _team.id,
      name: _team.name,
      offices: [defaultOffice._id],
    });

    return team;
  } catch (error) {
    return error;
  }
};

module.exports = { saveTeam };
