const app = require("./app");
const request = require("supertest");
const mongoose = require("mongoose");
const seedDB = require("./seedTestDB");

let token;

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
  targetUserId = obj.users[1]._id;
});

describe("GET /users", () => {
  it("should return an array of users", async () => {
    const res = await request(app)
      .get("/users")
      .set("Authorization", token)
      .set("Accept", "application/json");
    expect(res.statusCode).toEqual(200);
    expect(res.header["content-type"]).toEqual(expect.stringMatching(/json/));
    expect(res.body).toHaveProperty("users");
    expect(res.body.users).toHaveLength(3);
  });
});

describe("GET /users/:userId", () => {
  it("should return the specified user", async () => {
    const res = await request(app)
      .get(`/users/${targetUserId}`)
      .set("Authorization", token)
      .set("Accept", "application/json");
    expect(res.statusCode).toEqual(200);
    expect(res.header["content-type"]).toEqual(expect.stringMatching(/json/));
    expect(res.body).toHaveProperty("user");
    expect(res.body.user).toHaveProperty("friends");
    expect(res.body.user).toHaveProperty("posts");
  });
});

describe("Put /users/profileimage", () => {
  it("should return the updated user", async () => {
    const res = await request(app)
      .put(`/users/profileimage`)
      .set("Authorization", token)
      .set("Accept", "application/json")
      .set("Content-Type", "multipart/form-data")
      .attach("imageFile", "tests/testImage.jpg");
    expect(res.statusCode).toEqual(201);
    expect(res.header["content-type"]).toEqual(expect.stringMatching(/json/));
    expect(res.body).toHaveProperty("user");
    expect(res.body.message).toEqual("Profile picture update successful");
  });
});

afterAll(async () => {
  // Closing the DB connection allows Jest to exit successfully.
  await mongoose.connection.close();
});
