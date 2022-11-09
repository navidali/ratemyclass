var mongoose = require("mongoose");

var reviewSchema = new mongoose.Schema({
  course_name: String,
  rating: Number,
  description: String,
  date: { type: Date, default: Date.now },
});
module.exports = mongoose.model("Review", reviewSchema);
