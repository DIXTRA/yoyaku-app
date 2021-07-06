const { commands } = require('../utils/commands');

const listCommands = async ({ client, ack, say }) => {
  await ack();
  await say({
    blocks: commands.map((command) => ({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: command.description,
      },
    })),
  });
};

module.exports = { listCommands };
