module.exports = {
  view: {
    callback_id: 'reserve',
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
};
