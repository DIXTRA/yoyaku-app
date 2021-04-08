const mongoose = require('mongoose');

const { Schema, model } = mongoose;
const { ObjectId } = Schema.Types;

const OfficeSchema = new Schema({
  name: { type: String },
  rooms: [{ type: ObjectId, ref: 'Room', required: true }],
  enabled: { type: Boolean },
  maxVisitsAWeek: { type: Number },
});

const Office = model('Office', OfficeSchema);

module.exports = { OfficeSchema, Office };
