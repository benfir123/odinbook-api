const app = require("./app");
const request = require("supertest");
const mongoose = require("mongoose");
const seedDB = require("./seedTestDB");

let token;
let postId;
let commentId;

var Post = require("../models/post");
var User = require("../models/user");

beforeAll(async () => {
  const obj = await seedDB();
  const res = await request(app)
    .post("/auth/login")
    .send({
      username: "dsmith@example.com",
      password: "password",
    })
    .set("Accept", "application/json");
  token = res.body.token;

  const result = await request(app)
    .post("/posts")
    .set("Authorization", token)
    .set("Accept", "application/json")
    .attach("imageFile", "tests/testImage.jpg")
    .field("text", "Here is a post!");

  postId = result.body.post._id;
});

describe("POST /posts/:postId/comment", () => {
  it("creates and returns a new comment", async () => {
    const res = await request(app)
      .post(`/posts/${postId}/comments`)
      .send({
        comment: "Here is the comment!",
      })
      .set("Authorization", token)
      .set("Accept", "application/json");
    expect(res.statusCode).toEqual(201);
    expect(res.header["content-type"]).toEqual(expect.stringMatching(/json/));
    expect(res.body).toHaveProperty("comment");
    expect(res.body.comment.text).toEqual("Here is the comment!");

    commentId = res.body.comment._id;
  });
});

describe("PUT /posts/:postId/comments/:commentId", () => {
  it("likes a comment and returns it", async () => {
    const res = await request(app)
      .put(`/posts/${postId}/comments/${commentId}/like`)
      .set("Authorization", token)
      .set("Accept", "application/json");
    expect(res.statusCode).toEqual(201);
    expect(res.header["content-type"]).toEqual(expect.stringMatching(/json/));
    expect(res.body).toHaveProperty("comment");
    expect(res.body.message).toEqual("Comment liked");
  });
  it("unlikes a comment and returns it", async () => {
    const res = await request(app)
      .put(`/posts/${postId}/comments/${commentId}/like`)
      .set("Authorization", token)
      .set("Accept", "application/json");
    expect(res.statusCode).toEqual(201);
    expect(res.header["content-type"]).toEqual(expect.stringMatching(/json/));
    expect(res.body).toHaveProperty("comment");
    expect(res.body.message).toEqual("Comment unliked");
  });
});

afterAll(async () => {
  // Closing the DB connection allows Jest to exit successfully.
  await mongoose.connection.close();
});
