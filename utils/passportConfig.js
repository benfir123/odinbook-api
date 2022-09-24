require("dotenv").config();

const passport = require("passport");

const LocalStrategy = require("passport-local").Strategy;
const FacebookStrategy = require("passport-facebook");
const passportJWT = require("passport-jwt");
const JwtStrategy = passportJWT.Strategy;
const ExtractJwt = passportJWT.ExtractJwt;

const bcrypt = require("bcryptjs");
const User = require("../models/user");

//passport js's local strategy function
passport.use(
  new LocalStrategy((username, password, done) => {
    User.findOne({ email: username })
      .select("+password")
      .exec((err, user) => {
        if (err) {
          return done(err);
        }
        if (!user) {
          return done(null, false, { message: "Incorrect username" });
        }
        bcrypt.compare(password, user.password, (err, res) => {
          if (res) {
            // passwords match! log user in
            return done(null, user);
          } else {
            // passwords do not match!
            return done(null, false, {
              message: "Incorrect password",
            });
          }
        });
      });
  })
);

//passport js's JWT strategy function
passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET_KEY,
    },
    function (jwtPayload, done) {
      User.findOne({ _id: jwtPayload._id }, (err, user) => {
        if (err) {
          return done(err, false);
        }
        if (user) {
          return done(null, user);
        }
        return done(null, false);
      });
    }
  )
);

//passport js's Facebook strategy function
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: "https://odinbook-ben.herokuapp.com/auth/facebook/callback",
      fbGraphVersion: "v3.0",
    },
    function (accessToken, refreshToken, profile, done) {
      User.findOrCreate(
        { facebookId: profile.id },
        {
          first_name: profile._json.first_name,
          last_name: profile._json.last_name,
          email: profile._json.email,
          profile_pic_url: profile.photos[0].value,
        },
        function (error, user) {
          return done(error, user);
        }
      );
    }
  )
);
