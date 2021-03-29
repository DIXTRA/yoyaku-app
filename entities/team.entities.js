const mongoose = require('mongoose');

const { Schema } = mongoose;
const { ObjectId } = Schema.Types;

const TeamSchema = new mongoose.Schema({
  slackId: { type: String },
  name: { type: String },
  icon: { type: String },
  offices: [{ type: ObjectId, required: true }],
});

const Team = mongoose.model('Team', TeamSchema);

module.exports = { TeamSchema, Team };
