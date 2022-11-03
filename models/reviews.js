var mongoose = require("mongoose");

var reviewSchema = new mongoose.Schema({
  course_name: String,
  rating: Number,
  description: String,
});
module.exports = mongoose.model("Review", reviewSchema);
