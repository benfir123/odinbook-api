var faker = require("faker");

var User = require("./models/user");
var Comment = require("./models/comment");
var Post = require("./models/post");

require("./utils/mongoConfig");

const shuffleArray = (relArr) => {
  const array = [...relArr];
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

const setupTestDrive = async () => {
  const oldUser = await User.findOne({ email: "testuser@testuser.com" });
  let otherUsers = [];

  if (oldUser) {
    otherUsers = await User.find({ _id: { $ne: oldUser._id } });
    await Post.deleteMany({ author: oldUser._id });
    await Comment.deleteMany({
      author: oldUser._id,
    });
    await User.findByIdAndDelete(oldUser._id);

    for (user of otherUsers) {
      const updatedFriends = user.friends.filter((id) => id !== oldUser._id);
      const updatedFriendRequests = user.friend_requests.filter(
        (id) => id !== oldUser._id
      );
      user.friends = updatedFriends;
      user.friend_requests = updatedFriendRequests;
      await user.save();
    }
  } else {
    otherUsers = await User.find({});
  }

  const newUser = new User({
    first_name: "Test",
    last_name: "User",
    email: "testuser@testuser.com",
    password: faker.internet.password(),
    profile_pic_url: faker.image.imageUrl(),
    posts: [],
    friends: [],
    friend_requests: [],
  });

  const shuffledUsers = shuffleArray(otherUsers);
  const randSlicedUsers = shuffledUsers.slice(0, 9);
  const secondSlice = shuffledUsers.slice(10, 14);

  for (user of randSlicedUsers) {
    newUser.friends.push(user._id);
    user.friends.push(newUser._id);
    user.save();
  }

  for (user of secondSlice) {
    newUser.friend_requests.push(user._id);
  }

  const savedUser = await newUser.save();

  return savedUser;
};

module.exports = setupTestDrive;
