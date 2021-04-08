const mongoose = require('mongoose');

const { Schema, model } = mongoose;
const { ObjectId } = Schema.Types;

const TeamSchema = new Schema({
  slackId: { type: String },
  name: { type: String },
  icon: { type: String },
  offices: [{ type: ObjectId, required: true }],
});

const Team = model('Team', TeamSchema);

module.exports = { TeamSchema, Team };
