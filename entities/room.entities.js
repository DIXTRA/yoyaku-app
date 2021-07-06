const mongoose = require('mongoose');

const { Schema, model } = mongoose;

const RoomSchema = new Schema({
  name: { type: String },
  enabled: { type: Boolean },
  maxCapacity: { type: Number, default: 10 },
  default: { type: Boolean, default: true },
});

const Room = model('Room', RoomSchema);

module.exports = { RoomSchema, Room };
