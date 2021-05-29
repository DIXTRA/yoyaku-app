const { ValidationError } = require('admin-bro');
const { Office } = require('./office.entities');

/** @type {AdminBro.ResourceOptions} */
const options = {
  properties: {
    name: {
      isTitle: true,
      isRequired: true,
    },
    rooms: {
      isArray: true,
    },
  },
  listProperties: ['name', 'rooms', 'enabled', 'maxVisitsAWeek'],
  showProperties: ['_id', 'name', 'enabled', 'maxVisitsAWeek', 'rooms'],
  editProperties: ['name', 'enabled', 'maxVisitsAWeek', 'rooms'],
  filterProperties: ['enabled', 'name'],
  actions: {
    new: {
      before: async (request) => {
        request.payload.enabled = !!request.payload.enabled;
        const errors = {};

        if (!request.payload.name) {
          errors.name = 'You need to set a name before saving';
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
  resource: Office,
};
