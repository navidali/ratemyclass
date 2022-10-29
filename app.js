const methodOverride = require("method-override"),
  bodyParser = require("body-parser"),
  Course = require("./models/courses.js"),
  mongoose = require("mongoose"),
  express = require("express"),
  got = require("got"),
  app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static("assets"));
app.use(express.static("styles"));
//mongodb://mongo:27017/docker-node-mongo
mongoose
  .connect("mongodb://localhost:27017/docker-node-mongo", {
    useNewUrlParser: true,
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

ufcourses = [];

async function init_course_db() {
  Course.find({}, (err, courses) => {
    if (err) console.log(err);
    if (courses.length == 0) {
      for (let i = 0; i < ufcourses.length; i++) {
        const newCourse = {
          course_id: ufcourses[i].course_id,
          course_name: ufcourses[i].course_name,
          course_desc: ufcourses[i].course_desc,
          course_prereq: ufcourses[i].course_prereq,
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

got("https://one.ufl.edu/apix/soc/schedule/?term=2211&category=CWSP", {
  json: true,
})
  .then((response) => {
    //console.log(response.body[0].COURSES[0].name);
    //console.log(response.body[0].COURSES.length);
    for (let i = 0; i < response.body[0].COURSES.length; i++) {
      let newCourse = {
        course_id: response.body[0].COURSES[i].code,
        course_name: response.body[0].COURSES[i].name,
        course_desc: response.body[0].COURSES[i].description,
        course_prereq: response.body[0].COURSES[i].prerequisites,
      };
      ufcourses.push(newCourse);
    }
    init_course_db();
  })
  .catch((error) => {
    console.log(error.response.body);
  });

app.get("/", (req, res) => {
  res.render("home");
});

app.get("*", (req, res) => {
  res.send("Error - Page Not Found");
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server has started");
});
