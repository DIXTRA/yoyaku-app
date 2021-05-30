const { ValidationError } = require('admin-bro');
const { Room } = require('./room.entities');

/** @type {AdminBro.ResourceOptions} */
const options = {
  properties: {
    name: {
      isTitle: true,
      isRequired: true,
    },
    maxCapacity: {
      isRequired: true,
    },
  },
  listProperties: ['name', 'enabled', 'maxCapacity'],
  showProperties: ['_id', 'name', 'enabled', 'maxCapacity'],
  editProperties: ['name', 'enabled', 'maxCapacity'],
  filterProperties: ['enabled', 'name'],
  actions: {
    new: {
      before: async (request) => {
        request.payload.enabled = !!request.payload.enabled;
        const errors = {};

        if (!request.payload.name) {
          errors.name = 'You need to set a name before saving';
        }
        if (!request.payload.maxCapacity) {
          errors.maxCapacity = 'You need to set a maximum room capacity before saving';
        }

        if (Object.keys(errors).length > 0) {
          throw new ValidationError(errors, {
            message: 'Something went wrong, check for missing information',
          });
        }

        return request;
      },
    },
  },
};

module.exports = {
  options,
  resource: Room,
};
