const app = require("./app");
const request = require("supertest");

describe("POST /auth/signup", () => {
  it("should sign up a user and return 201 status code", (done) => {
    request(app)
      .post("/auth/signup")
      .send({
        first_name: "test",
        last_name: "test",
        email: "ben@ben.com",
        password: "123456",
        password_confirmation: "123456",
      })
      .expect("Content-Type", /json/)
      .expect({ message: "Sign up successful, please login." })
      .expect(201, done);
  });
  it("should fail sign up and give user the error messages", async () => {
    const response = await request(app).post("/auth/signup").send({
      first_name: "test",
      last_name: "test",
      email: "benben.com",
      password: "12345",
      password_confirmation: "12345",
    });
    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toEqual(422);
    expect(response.body.errors).toBeDefined();
  });
});

describe("POST /auth/login", () => {
  it("should log in a user and return 200 status code", (done) => {
    request(app)
      .post("/auth/login")
      .send({
        username: "ben@ben.com",
        password: "123456",
      })
      .expect("Content-Type", /json/)
      .expect(200, done);
  });

  it("should fail log in and give user the error messages", async () => {
    const response = await request(app).post("/auth/login").send({
      username: "benben.com",
      password: "12345",
    });
    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toEqual(422);
    expect(response.body.errors).toBeDefined();
  });
});
