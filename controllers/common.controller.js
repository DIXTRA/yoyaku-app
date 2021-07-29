const { commands } = require('../utils/commands');

const listCommands = async ({ client, ack, respond }) => {
  await ack();
  await respond({
    blocks: commands.map((command) => ({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: command.description,
      },
    })),
    response_type: 'ephemeral',
  });
};

module.exports = { listCommands };
