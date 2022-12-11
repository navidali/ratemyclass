const LocalStrategy = require("passport-local").Strategy;
const passport = require("passport");
const User = require("./models/users.js");

passport.use(
  "local-signup",
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
      passReqToCallback: true,
    },
    (req, email, password, done) => {
      process.nextTick(() => {
        User.findOne({ "local.email": email }, (err, user) => {
          if (err) return done(err);
          if (user) {
            return done(
              null,
              false,
              req.flash("Message", "That email is already taken.")
            );
          } else {
            var newUser = new User();
            newUser.local.name = req.body.name;
            newUser.local.email = email;
            newUser.local.password = newUser.generateHash(password);
            newUser.save((err) => {
              if (err) throw err;
              return done(null, newUser);
            });
          }
        });
      });
    }
  )
);

passport.use(
  "local-login",
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
      passReqToCallback: true,
    },
    (req, email, password, done) => {
      User.findOne({ "local.email": email }, (err, user) => {
        if (err) return done(err);
        if (!user)
          return done(null, false, req.flash("Message", "No user found."));
        if (!user.validPassword(password))
          return done(
            null,
            false,
            req.flash("Message", "Oops! Wrong password.")
          );
        return done(null, user);
      });
    }
  )
);

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});

module.exports = passport;
