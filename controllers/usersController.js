var express = require("express");
var router = express.Router();

const { body, validationResult } = require("express-validator");

var User = require("../models/user");
var Post = require("../models/post");
var Comment = require("../models/comment");

var multer = require("multer");
var path = require("path");

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/images");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); //Appending extension
  },
});

var upload = multer({ storage: storage });

router.get("/", async (req, res) => {
  try {
    const users = await User.find({});
    res.status(200).json({ users });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.get("/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .populate("friends")
      .populate("friend_requests")
      .populate("posts");
    res.status(200).json({ user });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.put(
  "/profileimage",
  body("imageFile")
    .custom((value, { req }) => {
      if (!req.file) {
        return "No image";
      } else if (
        req.file.mimetype === "image/bmp" ||
        req.file.mimetype === "image/gif" ||
        req.file.mimetype === "image/jpeg" ||
        req.file.mimetype === "image/png" ||
        req.file.mimetype === "image/tiff" ||
        req.file.mimetype === "image/webp"
      ) {
        return "image"; // return "non-falsy" value to indicate valid data"
      } else {
        return false; // return "falsy" value to indicate invalid data
      }
    })
    .withMessage("You may only submit image files."),

  upload.single("imageFile"),

  async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.json({ errors: errors.mapped() });
    }
    if (!req.file) {
      return res.json({ message: "No file attached" });
    }
    try {
      req.user.profile_pic_url = req.file
        ? path.join(__dirname, "/public/images/", req.file.filename)
        : null;

      const updatedUser = await req.user.save();

      return res.status(201).json({
        message: "Profile picture update successful",
        user: updatedUser,
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
);

module.exports = router;
