const mongoose = require("mongoose");
const findOrCreate = require("mongoose-findorcreate");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, select: false },
  profile_pic_url: { type: String },
  posts: [{ type: Schema.Types.ObjectId, ref: "Post" }],
  friends: [{ type: Schema.Types.ObjectId, ref: "User" }],
  friend_requests: [{ type: Schema.Types.ObjectId, ref: "User" }],
  facebookId: { type: String, required: false },
});

UserSchema.set("toObject", { virtuals: true });
UserSchema.set("toJSON", { virtuals: true });

UserSchema.virtual("full_name")
  .get(function () {
    // We don't use an arrow function as we'll need the this object
    return this.first_name + " " + this.last_name;
  })
  .set(function (newName) {
    var nameParts = newName.split(" ");
    this.first_name = nameParts[0];
    this.last_name = nameParts[1];
  });

UserSchema.plugin(findOrCreate);

//Export model
module.exports = mongoose.model("User", UserSchema);
