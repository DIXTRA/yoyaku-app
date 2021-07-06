const { Team } = require('../entities/team.entities');
const { User } = require('../entities/user.entities');

const registerUser = async ({ event }) => {
  try {
    const {
      profile,
      id: slackId,
      team_id,
      is_admin,
      is_owner,
      tz: timezone,
    } = event.user;
    const {
      first_name, last_name, phone, email, image_72,
    } = profile;

    const role = Number(is_admin || is_owner);

    const team = await Team.findOne({ slackId: team_id });

    if (!team) {
      return new Error(
        `No existe el team userId: ${slackId} - teamId: ${team_id}`,
      );
    }

    // By now password is not created from slack
    // First office in team is added to user by default
    const defaultOffice = team.offices[0];

    const user = new User({
      firstName: first_name,
      lastName: last_name,
      phoneNumber: phone,
      email,
      slackId,
      role,
      timezone,
      team: team._id,
      office: defaultOffice._id,
      profilePhoto: image_72,
    });

    const savedUser = await user.save();
    return savedUser;
  } catch (error) {
    return error;
  }
};

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
  registerUser,
  saveUsers,
};
