const moment = require('moment');
const { Team } = require('../entities/team.entities');
const { User } = require('../entities/user.entities');
const { Reservation } = require('../entities/reservation.entities');

const registerUser = async ({ event, client }) => {
  try {
    const {
      profile: userData,
      id: slackId,
      team_id,
      is_admin,
      is_owner,
      tz: timezone,
    } = event.user;
    const role = Number(is_admin || is_owner);

    const team = await Team.findOne({ slackId: team_id });

    if (!team) {
      return new Error(
        `No existe el team userId: ${slackId} - teamId: ${team_id}`,
      );
    }

    // By now password is not created from slack
    // First office in team is added to user by default

    const user = new User({
      name: userData.real_name,
      username: userData.display_name,
      email: userData.email,
      slackId,
      role,
      timezone,
      team,
      office: team.offices[0],
      profilePhoto: userData.image_512,
    });

    const savedUser = await user.save();
    console.log(`Usuario creado con éxito ${savedUser}`);
    return user;
  } catch (error) {
    console.error(error);
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
