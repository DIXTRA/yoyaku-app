const mongoose = require('mongoose');
const paginator = require('mongoose-paginate');
const bcrypt = require('bcrypt-nodejs');

const { Schema } = mongoose;
const { ObjectId } = Schema.Types;

const UserSchema = new mongoose.Schema({
  firstName: { type: String, default: '', index: true },
  lastName: { type: String, default: '', index: true },
  phoneNumber: { type: String, default: null, index: true },
  email: { type: String, required: true },
  role: { type: String, default: 0, index: true },
  encryptedPassword: { type: String, required: true },
  timezone: { type: String },
  team: { type: ObjectId, default: null },
  dob: {
    type: Date,
    default: null,
  },
  archived: { type: Boolean, default: false },
});

UserSchema.index({ email: 1 }, { unique: true });
UserSchema.plugin(paginator);

// methods ======================
// generating a hash
// eslint-disable-next-line max-len
UserSchema.methods.generateHash = (password) => bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);

// checking if password is valid
UserSchema.methods.validPassword = async (password) => bcrypt.compareSync(password, this.password);

UserSchema.methods.generateToken = () => {
  const stringUserId = `${this._id}`;
  const { role } = this;
  const token = jwt.sign(
    { userId: stringUserId, role },
    process.env.SECRET,
    {
      expiresIn: '30d',
    },
  );
  return token;
};

UserSchema.methods.generatePasswordResetToken = (identifier) => {
  const codeString = process.env.RESETSECRET;
  const token = jwt.sign({ userId: identifier }, codeString, {
    expiresIn: 3600,
  });
  return token;
};

const User = mongoose.model('User', UserSchema);

module.exports = { UserSchema, User };
