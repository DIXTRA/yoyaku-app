const mongoose = require('mongoose');

const { Schema, model } = mongoose;
const { ObjectId } = Schema.Types;

const ReservationSchema = new Schema({
  date: { type: Date },
  user: { type: ObjectId, ref: 'User' },
  room: { type: ObjectId, ref: 'Room' },
  office: { type: ObjectId, ref: 'Office' },
  team: { type: ObjectId, ref: 'Team' },
  status: { type: String },
});

const Reservation = model('Reservation', ReservationSchema);

module.exports = { ReservationSchema, Reservation };
