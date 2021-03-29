const mongoose = require('mongoose');

const { Schema } = mongoose;
const { ObjectId } = Schema.Types;

const ReservationSchema = new mongoose.Schema({
  date: { type: Date },
  user: { type: ObjectId, ref: 'User' },
  room: { type: ObjectId, ref: 'Room' },
  status: { type: String },
});

const Reservation = mongoose.model('Reservation', ReservationSchema);

module.exports = { ReservationSchema, Reservation };
