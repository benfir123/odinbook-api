var express = require("express");
const passport = require("passport");
var router = express.Router();

var authRouter = require("../controllers/authController");
var usersRouter = require("../controllers/usersController");
var friendsRouter = require("../controllers/friendsController");
var postsRouter = require("../controllers/postsController");

router.use("/auth", authRouter);
router.use(
  "/users",
  passport.authenticate("jwt", { session: false }),
  usersRouter
);
router.use(
  "/friends",
  passport.authenticate("jwt", { session: false }),
  friendsRouter
);

router.use(
  "/posts",
  passport.authenticate("jwt", { session: false }),
  postsRouter
);

module.exports = router;
