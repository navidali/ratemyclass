const LocalStrategy = require("passport-local").Strategy;
const passport = require("passport");
const bcrypt = require("bcrypt");
const User = require("./models/users.js");

passport.use(
  new LocalStrategy({ usernameField: "email" }, (email, password, done) => {
    User.findOne({ email: email })
      .then((user) => {
        if (!user) {
          console.log("User cannot be found");
          return done(null, false, { message: "User cannot be found" });
        } else {
          bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) throw err;
            if (isMatch) {
              return done(null, user);
            } else {
              return done(null, false, { message: "Wrong password" });
            }
          });
        }
      })
      .catch((err) => {
        return done(null, false, { message: err });
      });
  })
);
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => {
  User.findOne({ id: id }, (err, user) => {
    done(err, user);
  });
});

module.exports = passport;
