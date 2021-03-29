const mongoose = require('mongoose');

const { Schema } = mongoose;
const { ObjectId } = Schema.Types;

const OfficeSchema = new mongoose.Schema({
  name: { type: String },
  rooms: [{ type: ObjectId, ref: 'Room', required: true }],
  enabled: { type: Boolean },
  maxVisitsAWeek: { type: Number },
});

const Office = mongoose.model('Office', OfficeSchema);

module.exports = { OfficeSchema, Office };
