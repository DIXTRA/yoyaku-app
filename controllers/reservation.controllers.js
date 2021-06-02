const moment = require('moment');

const { UnsupportedMediaType } = require('http-errors');
const { Reservation } = require('../entities/reservation.entities');
const { User } = require('../entities/user.entities');
const { Team } = require('../entities/team.entities');

const listReservationByDate = async ({
  client, ack, say, body,
}) => {
  await ack();

  const {
    text,
    team_id: slackTeamId,
    user_id: slackUserId,
    channel_id: channelId,
  } = body;

  let date;
  if (text.length === 0) {
    date = new moment({ h: 0 });
  } else {
    if (!moment(text, 'DD/MM/YYYY').isValid()) {
      say(
        ':upside_down_face: *- Hey there, date format must be DD/MM/YYYY!*',
      );
      return;
    }
    date = new moment(text, 'DD/MM/YYYY');
  }

  const user = await User.findOne({ slackId: slackUserId });
  if (!user) {
    if (!user) {
      say(':scream: - Error: User not found.');
      return;
    }
  }

  const reservations = await Reservation.find({
    date: date.toDate(),
    office: user.office,
  })
    .populate('user', 'email firstName lastName profilePhoto ')
    .populate('office', 'name');

  if (reservations.length === 0) {
    say(
      `:calendar: *- No existen reservas para el ${date.format('DD/MM/YYYY')}.*`,
    );
    return;
  }

  const modalContent = newModal();

  modalContent[0].text.text = `${date.format('DD/MM/YYYY')} - ${
    reservations[0].office.name
  }`;

  for (let i = 0; i < reservations.length; i += 2) {
    let userData = reservations[i].user;
    userData.name = `${userData.firstName} ${userData.lastName}`;
    const row = {
      type: 'context',
      elements: newUserCard(
        userData.name,
        userData.email,
        userData.profilePhoto,
      ),
    };

    if (reservations[i + 1]) {
      userData = reservations[i + 1].user;
      userData.name = `${userData.firstName} ${userData.lastName}`;
      row.elements.concat(
        newUserCard(userData.name, userData.email, userData.profilePhoto),
      );
    }

    modalContent.push(row);
  }

  await client.views.open({
    trigger_id: body.trigger_id,
    view: {
      type: 'modal',
      title: {
        type: 'plain_text',
        text: 'Reservations',
      },
      blocks: modalContent,
    },
  });
};

const newModal = () => [
  {
    type: 'header',
    text: {
      type: 'plain_text',
      text: '',
      emoji: true,
    },
  },
  {
    type: 'divider',
  },
];

const newUserCard = (name, email, profilePhoto) => [
  {
    type: 'image',
    image_url: profilePhoto,
    alt_text: email,
  },
  {
    type: 'plain_text',
    text: name,
    emoji: true,
  },
];

const addReservation = async ({
  client, ack, say, body,
}) => {
  await ack();

  try {
    // Call views.open with the built-in client
    const result = await client.views.open({
      // Pass a valid trigger_id within 3 seconds of receiving it
      trigger_id: body.trigger_id,
      // View payload
      view: {
        callback_id: 'add_reserve',
        type: 'modal',
        title: {
          type: 'plain_text',
          text: 'Reserva tu lugar',
          emoji: true,
        },
        submit: {
          type: 'plain_text',
          text: 'Reservar',
          emoji: true,
        },
        close: {
          type: 'plain_text',
          text: 'Cancelar',
          emoji: true,
        },
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: '*Selecciona día y lugar para concurrir',
            },
          },
          {
            type: 'divider',
          },
          {
            type: 'section',
            block_id: 'date_input',
            text: {
              type: 'mrkdwn',
              text: 'Cuando vas a la oficina?',
            },
            accessory: {
              type: 'datepicker',
              initial_date: new Date().toISOString().split('T')[0],
              placeholder: {
                type: 'plain_text',
                text: 'Select a date',
                emoji: true,
              },
              action_id: 'datepicker-action',
            },
          },
          {
            type: 'section',
            block_id: 'site_input',
            text: {
              type: 'mrkdwn',
              text: ':clipboard: *A que espacio vas*',
            },
            accessory: {
              type: 'static_select',
              placeholder: {
                type: 'plain_text',
                text: 'Elige un lugar',
                emoji: true,
              },
              options: [
                {
                  text: {
                    type: 'plain_text',
                    text: '*this is plain_text text*',
                    emoji: true,
                  },
                  value: 'value-0',
                },
                {
                  text: {
                    type: 'plain_text',
                    text: '*this is plain_text text*',
                    emoji: true,
                  },
                  value: 'value-1',
                },
                {
                  text: {
                    type: 'plain_text',
                    text: '*this is plain_text text*',
                    emoji: true,
                  },
                  value: 'value-2',
                },
              ],
              action_id: 'static_select-action',
            },
          },
          {
            type: 'section',
            block_id: 'frecuency_input',
            text: {
              type: 'mrkdwn',
              text: 'Es una reserva recurrente?',
            },
            accessory: {
              type: 'checkboxes',
              options: [
                {
                  text: {
                    type: 'mrkdwn',
                    text: 'Repetir toda la semana',
                  },
                  description: {
                    type: 'mrkdwn',
                    text: 'Repetis la reserva toda la semana',
                  },
                  value: 'value-0',
                },
                {
                  text: {
                    type: 'mrkdwn',
                    text: 'Repetir todo el mes',
                  },
                  description: {
                    type: 'mrkdwn',
                    text: 'Repetis la reserva todo el mes',
                  },
                  value: 'value-1',
                },
                {
                  text: {
                    type: 'mrkdwn',
                    text: 'Repetir todo el año',
                  },
                  description: {
                    type: 'mrkdwn',
                    text: 'Repetis la reserva todo el año',
                  },
                  value: 'value-2',
                },
              ],
              action_id: 'checkboxes-action',
            },
          },
        ],
      },
    });
    console.log(result);
  } catch (error) {
    console.error(error);
  }
};

const submitReserve = async ({
  ack, body, view, client,
}) => {
  await ack();

  const { date_input, site_input, frecuency_input } = view.state.values;

  const date = date_input['datepicker-action'].selected_date;
  const office = site_input['static_select-action'].selected_option.value;
  const frecuency = frecuency_input['checkboxes-action'];
  const user = body.user.id;
  const team = body.team.id;

  if (!date) {
    handleErrorForms('La fecha es inválida', 'date_input', ack);
  }

  if (!office) {
    handleErrorForms('El lugar no es valido', 'site_input', ack);
  }

  if (!frecuency) {
    handleErrorForms('El lugar no es valido', 'frecuency_input', ack);
  }

  let message;

  const reservation = await Reservation.save({
    date,
    user,
    office,
    team,
  });

  if (!reservation) {
    message = 'Hubo un error al crear la reserva';
  } else {
    message = 'Reserva creada correctamente';
  }

  await client.chat.postMessage({
    channel: team,
    text: message,
  });
};

const handleErrorForms = (message, blockId, ack) => {
  try {
    ack({
      response_action: 'errors',
      errors: {
        [blockId]: message,
      },
    });
  } catch (error) {
    console.log('error', error);
  }
};

module.exports = {
  listReservationByDate,
  addReservation,
  submitReserve,
};
