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
    user_id: slackUserId,
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
    userData.name = userData.name || userData.username;
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
      userData.name = userData.name || userData.username;
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
      const formattedDate = date && moment(date, 'DD/MM/YYYY');

      if (!user) {
        throw ':scream: - Error: User not found.';
      }

      if (!formattedDate || !formattedDate.isValid()) {
        throw ':upside_down_face: *- Hey there, date format must be DD/MM/YYYY!*';
      }

      const fullDate = formattedDate.toDate();

      const invalidDate = !date || moment(fullDate).diff(currentDate, 'days') < 0;

      if (invalidDate) {
        throw ':upside_down_face: *- La fecha debe ser futura !*';
      }

      const room = await checkRoomExistence(body.user_id, say, roomName);
      if (!room) {
        throw ':upside_down_face: *- No se encontró una sala con ese nombre';
      }

      const startOfWeek = moment(fullDate).startOf('isoWeek');
      const endOfWeek = moment(fullDate).endOf('isoWeek');
      const query = {
        date: { $gt: startOfWeek, $lt: endOfWeek },
        user: user._id,
      };
      const currentOffice = await Office.findById(user.office);

      const weekResevationByUser = await Reservation.find(query);

      if (weekResevationByUser.length > currentOffice.maxVisitsAWeek) {
        throw ':upside_down_face: *- Alcanzaste el máximo de reservas esta semana';
      }

      const alreadyHaveReserve = await verifyAlreadyHaveReserve(
        fullDate,
        user.office,
        room._id,
        user._id,
      );

      if (alreadyHaveReserve) {
        throw ':upside_down_face: *- Ya tienes una reserva para este día';
      }

      const isRoomFull = await verifyRoomFull(fullDate, user.office, room._id);

      if (isRoomFull) {
        throw ':upside_down_face: *- La sala seleccionada no tiene más horarios disponibles';
      }

      const reservation = await Reservation.create({
        date: fullDate,
        user: user._id,
        team: user.team,
        office: user.office,
        room: room._id,
      });

      if (reservation) {
        say('Tu reserva fue creada correctamente 🙌🏻 📩 📝');
      } else {
        throw '  Uuups hubo un error al crear tu reserva 🙁 🥺 vuelve a internarlo más tarde';
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
                type: 'radio_buttons',
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
                      text: 'Este mes',
                      emoji: true,
                    },
                    value: 'month',
                  },
                ],
                action_id: 'radio_button-action',
              },
              label: {
                type: 'plain_text',
                text: 'Selecciona una frecuencia',
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

const verifyRoomFull = async (date, office, room) => {
  const roomCurrentReservations = await Reservation.find({
    date,
    office,
    room,
  })
    .populate('room', 'enabled maxCapacity')
    .populate('office', 'enabled maxVisitsAWeek');

  const isRoomFull = roomCurrentReservations.length
    && roomCurrentReservations.length
      >= roomCurrentReservations[0].room.maxCapacity;

  return isRoomFull;
};

const verifyAlreadyHaveReserve = async (date, office, room, user) => {
  const checkReserve = await Reservation.findOne({
    date,
    office,
    room,
    user,
  });

  return checkReserve;
};

const submitReserve = async ({
  ack, body, view, client,
}) => {
  let errors = {};

  const { date_input, site_input, frecuency_input } = view.state.values;
  const errorObject = { response_action: 'errors', errors: {} };

  const date = date_input['datepicker-action'].selected_date;
  const room = site_input['static_select-action'].selected_option;
  const frecuency = frecuency_input['radio_button-action'].selected_option;
  const slackId = body.user.id;

  const user = await User.findOne({ slackId });
  const currentDate = moment();
  const invalidDate = !date || moment(date).diff(currentDate, 'days') < 0;
  const isRoomFull = await verifyRoomFull(date, user.office, room.value);

  const startOfWeek = moment(date).startOf('isoWeek');
  const endOfWeek = moment(date).endOf('isoWeek');

  const query = { date: { $gt: startOfWeek, $lt: endOfWeek }, user: user._id };
  const currentOffice = await Office.findById(user.office);
  const alreadyHaveReserve = await verifyAlreadyHaveReserve(
    date,
    user.office,
    room.value,
    user._id,
  );

  const weekResevationByUser = await Reservation.find(query);

  if (invalidDate) {
    errorObject.errors = {
      date_input: 'La fecha debe ser futura',
    };
    errors = errorObject;
  }

  if (!room) {
    errorObject.errors = {
      site_input: 'Seleccione un lugar',
    };
    errors = errorObject;
  }

  if (!frecuency) {
    errorObject.errors = {
      date_input: 'La frecuencia no es válida',
    };
    errors = errorObject;
  }

  if (isRoomFull) {
    errorObject.errors = {
      site_input: 'No hay lugares disponible en esta sala',
    };
    errors = errorObject;
  }

  if (weekResevationByUser.length > currentOffice.maxVisitsAWeek) {
    errorObject.errors = {
      date_input: 'Alcanzaste el máximo de reservas esta semana',
    };
    errors = errorObject;
  }

  if (alreadyHaveReserve) {
    errorObject.errors = {
      date_input: 'Ya tienes una reserva para este día',
    };
    errors = errorObject;
  }

  let reservation;

  const verifyEachDay = async (_day) => {
    const repeteadDay = await verifyAlreadyHaveReserve(
      _day,
      user.office,
      room.value,
      user._id,
    );
    const roomFull = await verifyRoomFull(_day, user.office, room.value);

    if (repeteadDay) {
      errorObject.errors = {
        date_input: `No es posible agendarte, ya tienes una reserva para el día ${moment(
          _day,
        ).format('DD/MM/YYYY')}`,
      };
      errors = errorObject;
      return;
    }

    if (roomFull) {
      errorObject.errors = {
        date_input: `No es posible agendarte, el día ${moment(_day).format(
          'DD/MM/YYYY',
        )} tiene la sala llena`,
      };
      errors = errorObject;
      return;
    }

    const reservationPromise = await Reservation.create({
      date: _day,
      user: user._id,
      team: user.team,
      office: user.office,
      room: room.value,
    });

    return reservationPromise;
  };

  if (frecuency.value === 'day') {
    reservation = await Reservation.create({
      date,
      user: user._id,
      team: user.team,
      office: user.office,
      room: room.value,
    });
  }

  if (frecuency.value === 'week') {
    const start = moment(date).startOf('day');
    const end = moment(date).endOf('isoWeek');

    const days = [];
    let day = start;

    while (day <= end) {
      days.push(day.toDate());
      day = day.clone().add(1, 'd');
    }

    reservation = await Promise.all(days.map((_day) => verifyEachDay(_day)));
  }

  if (frecuency.value === 'month') {
    const start = moment(date).startOf('day');
    const end = moment(date).endOf('month');
    const days = [];
    let day = start;

    while (day <= end) {
      days.push(day.toDate());
      day = day.clone().add(1, 'd');
    }

    reservation = await Promise.all(days.map((_day) => verifyEachDay(_day)));
  }

  await ack(errors);

  let message;

  const hasErrors = Object.keys(errors).length;

  if (!hasErrors) {
    if (!reservation) {
      message = 'Uuups hubo un error al crear tu reserva 🙁 🥺 vuelve a internarlo más tarde';
    } else {
      message = 'Tu reserva fue creada correctamente 🙌🏻 📩 📝';
    }
  }

  await client.chat.postMessage({
    channel: body.user.id,
    text: message,
  });
};

module.exports = {
  listReservationByDate,
  addReservation,
  submitReserve,
};
