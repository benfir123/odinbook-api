var express = require("express");
var router = express.Router();

const User = require("../models/user");

router.post("/req", async function (req, res) {
  const { targetUserId } = req.body;
  try {
    const targetUser = await User.findById(targetUserId);

    // check requesting user is not the same as the targetevant user
    if (targetUser.id == req.user.id) {
      return res.status(400).json({ message: "You cannot friend yourself" });
    }

    // check that the requesting user is not already a friend of the targetevant user
    if (targetUser.friends.includes(req.user._id)) {
      return res
        .status(400)
        .json({ message: "You are already a friend of this user" });
    }

    // check that the requesting user has not already sent a friend request
    if (targetUser.friend_requests.includes(req.user._id)) {
      return res.status(400).json({
        message: "You have already sent a friend request to this user",
      });
    }
    // push the requesting user's id to the targetevant user's friendRequests array
    const updatedFriendReqs = [...targetUser.friend_requests, req.user._id];
    targetUser.friend_requests = updatedFriendReqs;
    const updatedUser = await targetUser.save();
    return res
      .status(201)
      .json({ message: "Friend request submitted", user: updatedUser });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.delete(
  "/cancel",

  async (req, res) => {
    const { targetUserId } = req.body;

    try {
      const targetUser = await User.findById(targetUserId);

      // check canceling user is not the same as the targetevant user
      if (!targetUser.friend_requests.includes(req.user._id)) {
        return res.status(404).json({ message: "Friend request not found." });
      }

      // delete the request
      const updatedRequests = targetUser.friend_requests.filter(
        (user) => user != req.user._id
      );
      targetUser.friend_requests = updatedRequests;
      const updatedUser = await targetUser.save();

      return res
        .status(200)
        .json({ message: "Friend request deleted", user: updatedUser });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
);

router.put(
  "/accept",

  async (req, res) => {
    const { targetUserId } = req.body;

    try {
      const targetUser = await User.findById(targetUserId);

      // check that accepting user has a friend request from targetevant user
      if (!req.user.friend_requests.includes(targetUserId)) {
        return res.status(400).json({
          message: "Friend request not found",
        });
      }

      const updatedFriendReqs = req.user.friend_requests.filter(
        (friendReq) => friendReq != targetUserId
      );
      req.user.friend_requests = updatedFriendReqs;
      const updatedFriends = [...req.user.friends, targetUserId];
      req.user.friends = updatedFriends;
      const updatedUser = await req.user.save();

      const updatedTargetUserFriends = [...targetUser.friends, req.user._id];
      targetUser.friends = updatedTargetUserFriends;
      await targetUser.save();

      const populatedUser = await User.findById(updatedUser._id).populate(
        "friends"
      );

      return res
        .status(201)
        .json({ message: "Friend request accepted", user: populatedUser });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
);

router.delete(
  "/decline",

  async (req, res) => {
    const { targetUserId } = req.body;

    try {
      const updatedFriendReqs = req.user.friend_requests.filter(
        (item) => item._id != targetUserId
      );
      req.user.friend_requests = updatedFriendReqs;
      const updatedUser = await req.user.save();

      return res
        .status(201)
        .json({ message: "Friend request declined", user: updatedUser });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
);

router.delete(
  "/remove",

  async (req, res) => {
    const { targetUserId } = req.body;

    try {
      const targetUser = await User.findById(targetUserId);

      // delete from user's friends list
      const updatedFriends = targetUser.friends.filter(
        (item) => item._id != req.user.id
      );
      targetUser.friends = updatedFriends;
      await targetUser.save();

      // delete from logged in user's friends list
      const loggedInUserUpdatedFriends = req.user.friends.filter(
        (item) => item._id != targetUserId
      );
      req.user.friends = loggedInUserUpdatedFriends;
      await req.user.save();

      return res.status(201).json({
        message: "Friend removed",
        targetUser: targetUser,
        loggedInUser: req.user,
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
);

module.exports = router;
