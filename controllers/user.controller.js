const moment = require("moment");

const { Reservation } = require("../entities/reservation.entities");
const { User } = require("../entities/user.entities");
const { Team } = require("../entities/team.entities");

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
    const role = is_admin || is_owner ? "ADMIN" : "USER";

    const team = await Team.findOne({ slackId: team_id });

    if (!team) {
      return new Error(
        `No existe el team userId: ${slackId} - teamId: ${team_id}`
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

    const user = await user.save();
    console.log(`Usuario creado con éxito ${user}`);
    return user;
  } catch (error) {
    console.error(error);
  }
};

module.exports = {
  registerUser,
};
