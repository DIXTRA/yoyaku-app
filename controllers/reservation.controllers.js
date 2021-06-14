const moment = require('moment');

const { Reservation } = require('../entities/reservation.entities');
const { User } = require('../entities/user.entities');
const { Office } = require('../entities/office.entities');

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
      say(':upside_down_face: *- Hey there, date format must be DD/MM/YYYY!*');
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
  const options = await getRooms(body.user_id, say);
  await ack();

  const { text } = body;

  try {
    // Call views.open with the built-in client
    if (text) {
      const command = text.split(' ');
      const date = command[0];
      const roomName = command[1];
      const slackId = body.user_id;
      const user = await User.findOne({ slackId });
      const currentDate = moment();

      if (!user) {
        say(':scream: - Error: User not found.');
        return;
      }

      if (!moment(date, 'DD/MM/YYYY').isValid()) {
        say(
          ':upside_down_face: *- Hey there, date format must be DD/MM/YYYY!*',
        );
        return;
      }

      const formatedDate = new moment(date, 'DD/MM/YYYY').toDate();
      const invalidDate = !date || moment(formatedDate).diff(currentDate, 'days') < 0;

      if (invalidDate) {
        say(':upside_down_face: *- La fecha seleccionada no es válida!*');
        return;
      }

      const room = await checkRoomExistence(body.user_id, say, roomName);
      if (!room) {
        say(':upside_down_face: *- No se encontró una sala con ese nombre');
        return;
      }

      const currentReservations = await Reservation.find({
        date: formatedDate,
        office: user.office,
        room: room._id,
      });

      const isRoomFull = currentReservations.length
        && currentReservations.length >= currentReservations[0].room.maxCapacity;

      if (isRoomFull) {
        say(
          ':upside_down_face: *- La sala selecciona no tiene más horarios disponibles',
        );
        return;
      }

      const reservation = await Reservation.create({
        date: formatedDate,
        user: user._id,
        team: user.team,
        office: user.office,
        room: room.value,
      });

      if (reservation) {
        say('Tu reserva fue creada correctamente 🙌🏻 📩 📝');
      } else {
        say(
          '  Uuups hubo un error al crear tu reserva 🙁 🥺 vuelve a internarlo más tarde',
        );
      }
    } else {
      await client.views.open({
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
              type: 'input',
              block_id: 'date_input',
              element: {
                type: 'datepicker',
                initial_date: new Date().toISOString().split('T')[0],
                action_id: 'datepicker-action',
              },
              label: {
                type: 'plain_text',
                text: 'Cuando vas a la oficina?',
                emoji: true,
              },
            },
            {
              type: 'input',
              block_id: 'frecuency_input',
              element: {
                type: 'checkboxes',
                options: [
                  {
                    text: {
                      type: 'plain_text',
                      text: 'Solo este día',
                      emoji: true,
                    },
                    value: 'day',
                  },
                  {
                    text: {
                      type: 'plain_text',
                      text: 'Esta semana',
                      emoji: true,
                    },
                    value: 'week',
                  },
                  {
                    text: {
                      type: 'plain_text',
                      text: 'Siempre',
                      emoji: true,
                    },
                    value: 'all',
                  },
                ],
                action_id: 'checkboxes-action',
              },
              label: {
                type: 'plain_text',
                text: 'Selecciona un lugar',
                emoji: true,
              },
            },
            {
              type: 'input',
              block_id: 'site_input',
              element: {
                type: 'static_select',
                placeholder: {
                  type: 'plain_text',
                  text: 'Selecciona un lugar',
                  emoji: true,
                },
                options,
                action_id: 'static_select-action',
              },
              label: {
                type: 'plain_text',
                text: 'Label',
                emoji: true,
              },
            },
          ],
        },
      });
    }
  } catch (error) {
    say(error);
  }
};

const getRooms = async (slackId, say) => {
  const user = await User.findOne({ slackId });
  if (!user) {
    say(':scream: - Error: User not found.');
    return;
  }

  const office = await Office.findById(user.office).populate(
    'rooms',
    'name _id',
  );

  if (!office) {
    say(':scream: - Error: Office not found.');
    return;
  }

  const { rooms } = office;

  return rooms.map((room) => ({
    text: {
      type: 'plain_text',
      text: room.name,
      emoji: true,
    },
    value: room._id,
  }));
};

const checkRoomExistence = async (slackId, say, roomName) => {
  const user = await User.findOne({ slackId });
  if (!user) {
    say(':scream: - Error: User not found.');
    return;
  }
  const office = await Office.findById(user.office).populate(
    'rooms',
    'name _id',
  );

  if (!office) {
    say(':scream: - Error: Office not found.');
    return;
  }

  const { rooms } = office;

  return rooms.find((room) => room.name === roomName);
};

const submitReserve = async ({
  ack, body, view, client,
}) => {
  let errors = {};

  const { date_input, site_input, frecuency_input } = view.state.values;

  const date = date_input['datepicker-action'].selected_date;
  const room = site_input['static_select-action'].selected_option;
  const frecuency = frecuency_input['checkboxes-action'].selected_options;
  const slackId = body.user.id;

  const user = await User.findOne({ slackId });
  const currentDate = moment();
  const invalidDate = !date || moment(date).diff(currentDate, 'days') < 0;
  const currentReservations = await Reservation.find({
    date,
    office: user.office,
    room: room.value,
  })
    .populate('room', 'enabled maxCapacity')
    .populate('office', 'enabled maxVisitsAWeek');
  const isRoomFull = currentReservations.length
    && currentReservations.length >= currentReservations[0].room.maxCapacity;

  if (invalidDate) {
    errors = {
      response_action: 'errors',
      errors: {
        date_input: 'La fecha no es válida',
      },
    };
  }

  if (!room) {
    errors = {
      response_action: 'errors',
      errors: {
        site_input: 'Seleccione un lugar',
      },
    };
  }

  if (isRoomFull) {
    errors = {
      response_action: 'errors',
      errors: {
        site_input: 'No hay lugares disponible en esta sala',
      },
    };
  }

  if (!frecuency.length) {
    errors = {
      response_action: 'errors',
      errors: {
        recuency_input: 'El frecuencia no es válida',
      },
    };
  }

  await ack(errors);

  let message;

  const hasErrors = Object.keys(errors).length;

  if (!hasErrors) {
    const reservation = await Reservation.create({
      date,
      user: user._id,
      team: user.team,
      office: user.office,
      room: room.value,
    });

    if (!reservation) {
      message = 'Uuups hubo un error al crear tu reserva 🙁 🥺 vuelve a internarlo más tarde';
    } else {
      message = 'Tu reserva fue creada correctamente 🙌🏻 📩 📝';
    }

    await client.chat.postMessage({
      channel: body.user.id,
      text: message,
    });
  }
};

module.exports = {
  listReservationByDate,
  addReservation,
  submitReserve,
};
