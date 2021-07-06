const { Office } = require('../entities/office.entities');

const createDefaultOffice = async (name, room) => {
  try {
    const office = await Office.create({
      name,
      rooms: [room],
      enabled: true,
      default: true,
    });
    return office;
  } catch (error) {
    return error;
  }
};

module.exports = { createDefaultOffice };
