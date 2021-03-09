const mongoose = require("mongoose");
const paginator = require("mongoose-paginate");
const bcrypt = require("bcrypt-nodejs");
const timestamps = require("mongoose-timestamps");

const UserSchema = new mongoose.Schema({
  firstName: { type: String, default: "", index: true },
  lastName: { type: String, default: "", index: true },
  phoneNumber: { type: String, default: "", index: true },
  email: { type: String, required: true },
  country: { type: String, required: true },
  city: { type: String, required: true },
  //nationality: { type: mongoose.Schema.Types.ObjectId, ref: "Nationality" },
  //platform: { type: mongoose.Schema.Types.ObjectId, ref: "Platform" },
  dni: { type: String, default: "", index: true }, // identity document number (ci/dni)
  taxDocument: { type: String, default: "", index: true }, // business rut/cuit/nif number
  role: { type: Number, default: 0, index: true }, //0 member, 1 admin, 2 leader
  encryptedPassword: { type: String, required: true },
  profileUrl: { type: String, default: "" },
  profileCompleted: { type: Boolean, default: false },

  //notifications
  emailNotificationsOn: { type: Boolean, default: true },
  pushNotificationsOn: { type: Boolean, default: true },

  dob: {
    day: Number,
    month: Number,
    year: Number,
  },

  device: {
    token: { type: String, sparse: true, index: true },
    os: { type: String, sparse: true, index: true },
  },
  archived: { type: Boolean, default: false },
});

UserSchema.index({ email: 1 }, { unique: true });
UserSchema.plugin(paginator);

// methods ======================
// generating a hash
UserSchema.methods.generateHash = (password) => {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
UserSchema.methods.validPassword = async (password) => {
  return bcrypt.compareSync(password, this.password);
};

UserSchema.methods.generateToken = () => {
  const stringUserId = this._id + "";
  const role = this.role;
  const token = jwt.sign(
    { userId: stringUserId, role: role },
    process.env.SECRET,
    {
      expiresIn: "30d",
    }
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

const User = mongoose.model("User", UserSchema);

module.exports = { UserSchema, User };
