const { Room } = require('../entities/room.entities');

const createDefaultRoom = async (name) => {
  try {
    const room = await Room.create({
      name,
      enabled: true,
    });
    return room;
  } catch (error) {
    return error;
  }
};

module.exports = { createDefaultRoom };
