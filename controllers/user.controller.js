const { Team } = require('../entities/team.entities');
const { User } = require('../entities/user.entities');

const saveUsers = async (users) => {
  const enabledUsers = users.filter((user) => !user.deleted);

  const batchingUsers = async (_user) => {
    const {
      profile, id, tz, team_id, is_admin, is_owner,
    } = _user;
    const {
      first_name, last_name, phone, email, image_72,
    } = profile;

    const role = Number(is_admin || is_owner);

    const team = await Team.findOne({
      slackId: team_id,
    });

    const defaultOffice = team.offices[0];

    const user = await User.create({
      firstName: first_name,
      lastName: last_name,
      phoneNumber: phone,
      email,
      slackId: id,
      role,
      timezone: tz,
      team: team._id,
      office: defaultOffice._id,
      profilePhoto: image_72,
    });

    return user;
  };

  try {
    await Promise.all(enabledUsers.map((user) => batchingUsers(user)));
  } catch (error) {
    return error;
  }
};

module.exports = {
  saveUsers,
};
