const methodOverride = require("method-override"),
  bodyParser = require("body-parser"),
  Course = require("./models/courses.js"),
  Review = require("./models/reviews.js"),
  mongoose = require("mongoose"),
  express = require("express"),
  got = require("got"),
  app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static("assets"));
app.use(express.static("styles"));
mongoose
  .connect("mongodb://localhost:27017/classes", {
    useNewUrlParser: true,
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

ufcourses = [];

async function init() {
  if (ufcourses == 0) {
    await got(
      "https://one.ufl.edu/apix/soc/schedule/?term=2211&category=CWSP",
      {
        json: true,
      }
    )
      .then((response) => {
        for (let i = 0; i < response.body[0].COURSES.length; i++) {
          let newCourse = {
            id: response.body[0].COURSES[i].code,
            name: response.body[0].COURSES[i].name,
            description: response.body[0].COURSES[i].description,
            prerequisites: response.body[0].COURSES[i].prerequisites,
          };
          ufcourses.push(newCourse);
        }
        init_course_db();
      })
      .catch((error) => {
        console.log(error.response.body);
      });
  }
}

function init_course_db() {
  Course.find({}, (err, courses) => {
    if (err) console.log(err);
    if (courses.length == 0) {
      for (let i = 0; i < ufcourses.length; i++) {
        const newCourse = {
          id: ufcourses[i].id,
          name: ufcourses[i].name,
          description: ufcourses[i].description,
          prerequisites: ufcourses[i].prerequisites,
        };
        Course.create(newCourse, (err, course) => {
          if (err) {
            console.log(err);
          }
        });
      }
      console.log("Api call completed");
    } else console.log("already initialized");
  });
}

init();

app.get("/", (req, res) => {
  res.render("home", { courses: ufcourses });
});

app.get("/:courseId", (req, res) => {
  console.log(req.params.courseId);
  Course.find({ name: req.params.courseId }, function (err, course) {
    if (err) {
      console.log(err);
    } else {
      Review.find({ course_name: req.params.courseId }, function (err, review) {
        if (err) {
          console.log(err);
        } else {
          console.log(review);
          res.render("view", { course: course[0], review: review });
        }
      });
    }
  });
});

app.post("/:courseId", (req, res) => {
  const course_name = req.params.courseId,
    rating = req.body.rating,
    description = req.body.description;

  const newReview = {
    course_name: course_name,
    rating: rating,
    description: description,
  };

  Review.create(newReview, (err, review) => {
    if (err) {
      console.log(err);
      res.render("new", { course: course });
    } else {
      Course.find({ name: req.params.courseId }, function (err, course) {
        if (err) {
          console.log(err);
        } else {
          res.render("view", { course: course[0], review: review });
        }
      });
    }
  });
});

app.get("/:courseId/new", (req, res) => {
  Course.find({ name: req.params.courseId }, function (err, course) {
    if (err) {
      console.log(err);
    } else {
      res.render("new", { course: course[0] });
    }
  });
});

app.get("*", (req, res) => {
  res.send("Error - Page Not Found");
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server has started");
});
