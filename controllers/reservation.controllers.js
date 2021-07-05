const moment = require("moment");

const { Reservation } = require("../entities/reservation.entities");
const { User } = require("../entities/user.entities");
const { Team } = require("../entities/team.entities");

const listReservationByDate = async ({ client, ack, say, body }) => {
  await ack();

  const {
    text,
    user_id: slackUserId,
  } = body;

  let date;
  if (text.length === 0) {
    date = new moment({ h: 0 });
  } else {
    if (!moment(text, "DD/MM/YYYY").isValid()) {
      say(
        `:upside_down_face: *- Hey there, date format must be DD/MM/YYYY!*`
      );
      return;
    } else {
      date = new moment(text, "DD/MM/YYYY");
    }
  }

  const user = await User.findOne({ slackId: slackUserId });
  if (!user) {
    if (!user) {
      say(":scream: - Error: User not found.");
      return;
    }
  }

  const reservations = await Reservation.find({
    date: date.toDate(),
    office: user.office,
  })
    .populate("user", "email name username profilePhoto ")
    .populate("office", "name");

  if (reservations.length === 0) {
    say(
      `:calendar: *- No bookings for ${date.format("DD/MM/YYYY")}.*`
    );
    return;
  }

  const modalContent = newModal();

  modalContent[0].text.text = `${date.format("DD/MM/YYYY")} - ${
    reservations[0].office.name
  }`;

  for (let i = 0; i < reservations.length; i += 2) {
    let userData = reservations[i].user;
    userData.name = userData.name || userData.username;
    const row = {
      type: "context",
      elements: newUserCard(
        userData.name,
        userData.email,
        userData.profilePhoto
      ),
    };

    if (reservations[i + 1]) {
      userData = reservations[i + 1].user;
      userData.name = userData.name || userData.username;
      row.elements.concat(
        newUserCard(userData.name, userData.email, userData.profilePhoto)
      );
    }

    modalContent.push(row);
  }

  await client.views.open({
    trigger_id: body.trigger_id,
    view: {
      type: "modal",
      title: {
        type: "plain_text",
        text: "Reservations",
      },
      blocks: modalContent,
    },
  });
};

const newModal = () => {
  return [
    {
      type: "header",
      text: {
        type: "plain_text",
        text: "",
        emoji: true,
      },
    },
    {
      type: "divider",
    },
  ];
};

const newUserCard = (name, email, profilePhoto) => {
  return [
    {
      type: "image",
      image_url: profilePhoto,
      alt_text: email,
    },
    {
      type: "plain_text",
      text: name,
      emoji: true,
    },
  ];
};

module.exports = {
  listReservationByDate,
};
