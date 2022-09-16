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

describe("POST /friends/req ", () => {
  it("should submit friend requests properly", async () => {
    const res = await request(app)
      .post("/friends/req")
      .send({
        targetUserId: targetUserId,
      })
      .set("Authorization", token)
      .set("Accept", "application/json");
    expect(res.statusCode).toEqual(201);
    expect(res.header["content-type"]).toEqual(expect.stringMatching(/json/));
    expect(res.body).toHaveProperty("user");
    expect(res.body.message).toEqual("Friend request submitted");
  });
});

describe("POST /friends/cancel ", () => {
  it("should cancel the outgoing friend request properly", async () => {
    const res = await request(app)
      .delete("/friends/cancel")
      .send({
        targetUserId: targetUserId,
      })
      .set("Authorization", token)
      .set("Accept", "application/json");
    expect(res.statusCode).toEqual(200);
    expect(res.header["content-type"]).toEqual(expect.stringMatching(/json/));
    expect(res.body).toHaveProperty("user");
    expect(res.body.message).toEqual("Friend request deleted");
  });
});

describe("POST /friends/accept ", () => {
  it("should accept the outgoing friend request properly", async () => {
    const res = await request(app)
      .put("/friends/accept")
      .send({
        targetUserId: targetUserId,
      })
      .set("Authorization", token)
      .set("Accept", "application/json");
    expect(res.statusCode).toEqual(400);
    expect(res.header["content-type"]).toEqual(expect.stringMatching(/json/));
  });
});

afterAll(async () => {
  // Closing the DB connection allows Jest to exit successfully.
  await mongoose.connection.close();
});
