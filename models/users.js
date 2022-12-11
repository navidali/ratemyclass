var mongoose = require("mongoose");
var bcrypt = require("bcrypt");

var userSchema = new mongoose.Schema({
  local: {
    name: { type: String, required: true },
    email: { type: String, require: true },
    password: { type: String, require: true },
  },
  facebook: {
    id: { type: String, require: true },
    token: { type: String, require: true },
    name: { type: String, require: true },
    email: { type: String, require: true },
  },
  twitter: {
    id: { type: String, require: true },
    token: { type: String, require: true },
    displayName: { type: String, require: true },
    username: { type: String, require: true },
  },
  google: {
    id: { type: String, require: true },
    token: { type: String, require: true },
    email: { type: String, require: true },
    name: { type: String, require: true },
  },
});

userSchema.methods.generateHash = function (password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

userSchema.methods.validPassword = function (password) {
  return bcrypt.compareSync(password, this.local.password);
};

module.exports = mongoose.model("User", userSchema);
