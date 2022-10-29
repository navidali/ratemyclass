var mongoose = require("mongoose");

var courseSchema = new mongoose.Schema({
  course_id: String,
  course_name: String,
  course_desc: String,
  course_prereq: String,
});
module.exports = mongoose.model("Course", courseSchema);
