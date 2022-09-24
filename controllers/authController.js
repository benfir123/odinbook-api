var express = require("express");
var router = express.Router();

const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const jwt = require("jsonwebtoken");

const User = require("../models/user");
const setupTestDrive = require("../setupTestDrive");

router.post("/signup", [
  // Validate and sanitize fields.
  body("first_name", "Please do not leave first name empty.")
    .trim()
    .isLength({ min: 1, max: 100 })
    .escape(),
  body("last_name", "Please do not leave last name empty.")
    .trim()
    .isLength({ min: 1, max: 100 })
    .escape(),
  body("email", "Please enter a valid email address.")
    .trim()
    .isEmail()
    .escape(),
  body("password", "Please use a password with over 6 characters.")
    .trim()
    .isLength({ min: 6, max: 100 })
    .escape(),
  body(
    "password_confirmation",
    "Password confirmation must match the original password"
  )
    .exists()
    .custom((value, { req }) => value === req.body.password),

  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    bcrypt.hash(req.body.password, 10, (err, hashedPassword) => {
      // if err, do something
      if (err) {
        return next(err);
      }
      // otherwise, store hashedPassword in DB
      const user = new User({
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        email: req.body.email,
        password: hashedPassword,
        profile_pic_url: "",
        posts: [],
        friends: [],
        friend_requests: [],
      });
      if (!errors.isEmpty()) {
        res.status(422).json({ errors: errors.mapped() });
        return;
      }
      user.save((err) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        return res.status(201).json({
          message: "Sign up successful, please login.",
        });
      });
    });
  },
]);

router.post(
  "/login",
  body("username", "Invalid username").trim().isEmail().escape(),
  body("password", "Invalid password")
    .trim()
    .isLength({ min: 6, max: 100 })
    .escape(),
  (req, res, next) => {
    // Extract the validation errors from request.
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.status(422).json({ errors: errors.mapped() });
      return;
    }

    passport.authenticate("local", { session: false }, (err, user, info) => {
      if (err) {
        res.status(404).json(err);
        return;
      }
      if (user) {
        jwt.sign(
          { _id: user._id },
          process.env.JWT_SECRET_KEY,
          (err, token) => {
            if (err) {
              res.status(500).json(err);
            }
            res.status(200).json({
              message: "Log in successful",
              token: "Bearer " + token,
              user: {
                first_name: user.first_name,
                last_name: user.last_name,
                full_name: user.full_name,
                email: user.email,
                id: user.id,
                _id: user._id,
                profile_pic_url: user.profile_pic_url
                  ? user.profile_pic_url
                  : "",
              },
            });
          }
        );
      } else {
        res.status(401).json(info);
      }
    })(req, res, next);
  }
);

router.post("/testdrive", async (req, res, next) => {
  const user = await setupTestDrive();

  jwt.sign({ _id: user._id }, process.env.JWT_SECRET_KEY, (err, token) => {
    if (err) {
      res.status(500).json(err);
    }
    res.status(201).json({
      message: "Log in successful",
      token: "Bearer " + token,
      user: {
        first_name: user.first_name,
        last_name: user.last_name,
        full_name: user.full_name,
        email: user.email,
        id: user.id,
        _id: user._id,
        profile_pic_url: user.profile_pic_url ? user.profile_pic_url : "",
      },
    });
  });
});

router.get("/facebook", passport.authenticate("facebook", { session: false }));

router.get(
  "/facebook/callback",
  passport.authenticate("facebook"),
  (err, user, info) => {
    if (err) return next(err);
    jwt.sign({ _id: user._id }, process.env.JWT_SECRET_KEY, (err, token) => {
      if (err) {
        res.status(500).json(err);
      }
      res.status(200).json({
        message: "Log in successful",
        token: "Bearer " + token,
        user: {
          first_name: user.first_name,
          last_name: user.last_name,
          full_name: user.full_name,
          email: user.email,
          id: user.id,
          _id: user._id,
          profile_pic_url: user.profile_pic_url ? user.profile_pic_url : "",
        },
      });
    });
  }
);

module.exports = router;
