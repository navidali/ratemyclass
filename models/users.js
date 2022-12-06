var mongoose = require("mongoose");

var userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  id: { type: Date, default: Date.now },
});
module.exports = mongoose.model("User", userSchema);
