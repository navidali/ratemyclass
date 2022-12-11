const methodOverride = require("method-override"),
  bodyParser = require("body-parser"),
  Course = require("./models/courses.js"),
  Review = require("./models/reviews.js"),
  User = require("./models/users.js"),
  mongoose = require("mongoose"),
  express = require("express"),
  session = require("express-session"),
  flash = require("express-flash"),
  cookieParser = require("cookie-parser"),
  got = require("got"),
  app = express();

const passport = require("./passport-config");

app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(flash());
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());

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

function init() {
  Course.find({}, (err, courses) => {
    if (err) console.log(err);
    if (courses.length == 0) {
      got("https://one.ufl.edu/apix/soc/schedule/?term=2211&category=CWSP", {
        json: true,
      })
        .then((response) => {
          for (let i = 0; i < response.body[0].COURSES.length; i++) {
            let newCourse = {
              id: response.body[0].COURSES[i].code,
              name: response.body[0].COURSES[i].name,
              description: response.body[0].COURSES[i].description,
              prerequisites: response.body[0].COURSES[i].prerequisites,
            };
            Course.create(newCourse, (err, course) => {
              if (err) {
                console.log(err);
              }
            });
          }
        })
        .catch((error) => {
          console.log(error.response.body);
        });
      console.log("Api call completed");
    } else console.log("already initialized");
  });
}

init();

app.get("/login", checkNotAuthenticated, (req, res) => {
  res.render("login.ejs", { message: req.flash("Message") });
});

app.post(
  "/login",
  passport.authenticate("local-login", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true,
  })
);

app.get("/register", checkNotAuthenticated, (req, res) => {
  res.render("login.ejs", { message: req.flash("Message") });
});

app.post(
  "/register",
  passport.authenticate("local-signup", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true,
  })
);

app.get("/", (req, res) => {
  Course.find({}, (err, courses) => {
    if (err) console.log(err);
    else res.render("home", { courses: courses, user: req.user });
  });
});

app.get("/courses/:courseId", (req, res) => {
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

app.post("/courses/:courseId", (req, res) => {
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
    }
  });

  Course.find({ name: req.params.courseId }, function (err, course) {
    if (err) {
      console.log(err);
    } else {
      Review.find({ course_name: req.params.courseId }, function (err, review) {
        if (err) {
          console.log(err);
        } else {
          res.render("view", { course: course[0], review: review });
        }
      });
    }
  });
});

app.get("/courses/:courseId/new", isLoggedIn, (req, res) => {
  Course.find({ name: req.params.courseId }, function (err, course) {
    if (err) {
      console.log(err);
    } else {
      res.render("new", { course: course[0] });
    }
  });
});

app.get("/logout", (req, res) => {
  req.logout(req.user, (err) => {
    if (err) return next(err);
    res.redirect("/");
  });
});

app.get("*", (req, res) => {
  res.redirect("/");
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect("/login");
}

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect("/");
  }
  next();
}

app.listen(process.env.PORT || 3000, () => {
  console.log("Server has started");
});
