const { DateTime } = require("luxon");
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const PostSchema = new Schema({
  text: { type: String, required: true },
  photo_url: { type: String, required: false },
  added: { type: Date, default: Date.now },
  author: { type: Schema.Types.ObjectId, ref: "User" },
  likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
  comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
});

PostSchema.virtual("added_formatted").get(function () {
  return DateTime.fromJSDate(this.added).toLocaleString(DateTime.DATE_MED);
});

//Export model
module.exports = mongoose.model("Post", PostSchema);
