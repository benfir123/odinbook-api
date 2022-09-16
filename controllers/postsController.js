var express = require("express");
var router = express.Router();

const Post = require("../models/post");

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

const { body, validationResult } = require("express-validator");

var commentsRouter = require("../controllers/commentsController");

router.use("/:postId/comments", commentsRouter);

// GET all posts (self + friends) (10 at a time)
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find(
      { author: [req.user.id, ...req.user.friends] },
      null,
      {
        limit: 10,
      }
    )
      .sort({ added: "desc" })
      .populate("author")
      .populate({
        path: "comments",
        model: "Comment",
        populate: {
          path: "author",
          model: "User",
        },
      });

    return res.status(200).json({ posts: posts });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate("comments").exec();
    if (post) {
      // Check that requesting user is permitted to view the post
      if (
        post.author != req.user.id &&
        !req.user.friends.includes(post.author)
      ) {
        return res.status(401).json({
          message: "You must be friends with the author to view this post",
        });
      }
      // if allowed to view, return post
      return res.status(200).json({ post: post });
    } else {
      return res.status(404).json({ message: "Post not found" });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.post("/", [
  upload.single("imageFile"),
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

  body("text", "post text is required").trim().isLength({ min: 1 }).escape(),

  async (req, res) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(400).json({ errors: result.mapped() });
    }
    if (!req.file) {
      return res.json({ message: "No file attached" });
    }
    try {
      const newPost = new Post({
        author: req.user.id,
        text: req.body.text,
        added: new Date(),
        comments: [],
        likes: [],
        photo_url: req.file
          ? path.join(__dirname, "/public/images/", req.file.filename)
          : null,
      });
      const savedPost = await newPost.save();
      const relPost = await Post.findById(savedPost._id).populate("author");
      if (relPost) {
        return res
          .status(201)
          .json({ message: "Succesfully posted", post: relPost });
      }
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  },
]);

router.put(
  "/:postId/like",

  async (req, res) => {
    try {
      const relPost = await Post.findById(req.params.postId);

      if (!relPost) {
        return res.status(404).json({ message: "Post not found" });
      }

      if (relPost.likes.includes(req.user.id)) {
        const likesArray = [...relPost.likes];
        const filteredLikesArray = likesArray.filter(
          (userId) => userId != req.user.id
        );
        relPost.likes = filteredLikesArray;
        const updatedPost = await relPost.save();

        return res
          .status(201)
          .json({ message: "Post unliked", post: updatedPost });
      }

      relPost.likes.push(req.user.id);
      const updatedPost = await relPost.save();

      return res.status(201).json({ message: "Post liked", post: updatedPost });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }
);

module.exports = router;
