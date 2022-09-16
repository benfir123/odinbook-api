const app = require("./app");
const request = require("supertest");
const mongoose = require("mongoose");
const seedDB = require("./seedTestDB");

let token;
let postId;

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
});

describe("GET /posts", () => {
  it("should return an array of posts", async () => {
    const res = await request(app)
      .get("/posts")
      .set("Authorization", token)
      .set("Accept", "application/json");
    expect(res.statusCode).toEqual(200);
    expect(res.header["content-type"]).toEqual(expect.stringMatching(/json/));
    expect(res.body).toHaveProperty("posts");
    expect(res.body.posts.length).toEqual(6);

    postId = res.body.posts[0]._id;
  });
});

describe("GET /posts/:postId", () => {
  it("should return the relevant post", async () => {
    const res = await request(app)
      .get(`/posts/${postId}`)
      .set("Authorization", token)
      .set("Accept", "application/json");
    expect(res.statusCode).toEqual(200);
    expect(res.header["content-type"]).toEqual(expect.stringMatching(/json/));
    expect(res.body).toHaveProperty("post");
    expect(res.body.post._id).toEqual(postId);
  });
});

describe("POST /posts/", () => {
  it("should return the new post", async () => {
    const res = await request(app)
      .post("/posts")
      .set("Authorization", token)
      .set("Accept", "application/json")
      .attach("imageFile", "tests/testImage.jpg")
      .field("text", "Here is a post!");

    expect(res.statusCode).toEqual(201);
    expect(res.header["content-type"]).toEqual(expect.stringMatching(/json/));
    expect(res.body).toHaveProperty("post");
    expect(res.body.post.text).toEqual("Here is a post!");
    expect(res.body.post.photo_url).toContain("public");

    postId = res.body.post._id;
  });
});

describe("PUT /posts/:postId/like", () => {
  it("should return the newly liked post", async () => {
    const res = await request(app)
      .put(`/posts/${postId}/like`)
      .set("Authorization", token)
      .set("Accept", "application/json");
    expect(res.statusCode).toEqual(201);
    expect(res.header["content-type"]).toEqual(expect.stringMatching(/json/));
    expect(res.body).toHaveProperty("post");
    expect(res.body.message).toEqual("Post liked");
  });
  it("should return the newly unliked post", async () => {
    const res = await request(app)
      .put(`/posts/${postId}/like`)
      .set("Authorization", token)
      .set("Accept", "application/json");
    expect(res.statusCode).toEqual(201);
    expect(res.header["content-type"]).toEqual(expect.stringMatching(/json/));
    expect(res.body).toHaveProperty("post");
    expect(res.body.message).toEqual("Post unliked");
  });
});

afterAll(async () => {
  // Closing the DB connection allows Jest to exit successfully.
  await mongoose.connection.close();
});
