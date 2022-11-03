var mongoose = require("mongoose");

var courseSchema = new mongoose.Schema({
  id: String,
  name: String,
  description: String,
  prerequisites: String,
});
module.exports = mongoose.model("Course", courseSchema);
