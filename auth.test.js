require("dotenv").config({path: './.env'});

const request = require("supertest");

const app = require("./src/app");

const signUpData = {
    name:"aaa",
    username: "testing22",
    email: "testing22@test.com",
    password: "testing123"
}

describe("POST /api/auth/signup", () => {
  test("USER SIGNUP", async () => {
    return request(app)
      .post("/api/auth/signup")
    //      .set('Cookie', ['authToken=mock_secret_token_123'])
      .send(signUpData)
      .expect(201)
      .then((res) => {
        
      });
  });
});
