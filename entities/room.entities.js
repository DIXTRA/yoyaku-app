const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
  name: { type: String },
  enabled: { type: Boolean },
  maxCapacity: { type: Boolean },
});

const Room = mongoose.model('Room', RoomSchema);

module.exports = { RoomSchema, Room };
