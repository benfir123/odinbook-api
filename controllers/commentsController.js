var express = require("express");
var router = express.Router({ mergeParams: true });

const { body, validationResult } = require("express-validator");
const Post = require("../models/post");
const Comment = require("../models/comment");

router.post(
  "/",

  body("comment", "Comment required").trim().isLength({ min: 1 }).escape(),

  async (req, res) => {
    const { comment } = req.body;

    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(400).json({ errors: result.mapped() });
    }

    try {
      const newComment = new Comment({
        author: req.user._id,
        text: comment,
        added: new Date(),
        post: req.params.postId,
        likes: [],
      });

      const savedComment = await newComment.save();

      const relPost = await Post.findById(req.params.postId);
      relPost.comments.push(savedComment);
      await relPost.save();

      const populatedComment = await Comment.findById(
        savedComment._id
      ).populate("author");
      return res
        .status(201)
        .json({ message: "Comment saved", comment: populatedComment });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }
);

router.put(
  "/:commentId/like",

  async (req, res) => {
    try {
      const relComment = await Comment.findById(req.params.commentId);

      if (!relComment) {
        return res.status(404).json({ message: "Comment not found" });
      }

      if (relComment.likes.includes(req.user.id)) {
        const likesArray = [...relComment.likes];
        const filteredLikesArray = likesArray.filter(
          (userId) => userId != req.user.id
        );
        relComment.likes = filteredLikesArray;
        const updatedComment = await relComment.save();

        return res
          .status(201)
          .json({ message: "Comment unliked", comment: updatedComment });
      }

      relComment.likes.push(req.user._id);
      const updatedComment = await relComment.save();

      return res
        .status(201)
        .json({ message: "Comment liked", comment: updatedComment });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }
);

module.exports = router;
