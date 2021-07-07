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
    disableAssistanceToOffice: {
      actionType: 'record',
      icon: 'CheckboxIndeterminateFilled',
      component: false,
      isVisible: (context) => !!context.record.param('enabled'),
      handler: async (req, res, context) => {
        const { record, currentAdmin, h } = context;

        const userCar = await Office.findById(record.param('_id'));
        userCar.enabled = false;
        await userCar.save();

        const office = record.toJSON(currentAdmin);
        office.params.enabled = false;

        return {
          record: office,
          notice: { message: 'Successfully disabled visitors to the selected office', type: 'success' },
          redirectUrl: h.listUrl('Office'),
        };
      },
    },
    enableAssistanceToOffice: {
      actionType: 'record',
      icon: 'CheckboxChecked',
      component: false,
      isVisible: (context) => !context.record.param('enabled'),
      handler: async (req, res, context) => {
        const { record, currentAdmin, h } = context;

        const userCar = await Office.findById(record.param('_id'));
        userCar.enabled = true;
        await userCar.save();

        const office = record.toJSON(currentAdmin);
        office.params.enabled = true;

        return {
          record: office,
          notice: { message: 'Successfully enabled visitors to the selected office', type: 'success' },
          redirectUrl: h.listUrl('Office'),
        };
      },
    },
  },
};

module.exports = {
  options,
  resource: Office,
};
