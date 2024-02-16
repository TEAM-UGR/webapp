const request = require("supertest");
const app = require("./index.js");
const databaseName = process.env.DATABASE;
const initializeSequelize = require("./config/sequelizeConfig.js");
const sequelize = initializeSequelize(databaseName);

const createDatabase = require("./config/createDB.js");
const startupDB = require("./config/startupDatabase.js");

beforeAll(async () => {
  await startupDB();
  
  // await createDatabase();
  // await sequelize.sync({force: false});
});

describe("Integration Test 1 for creating a user and validating using GET", () => {
  test("POST /v1/user - success - Create User", async () => {
    const req = {
      first_name: "Rohan",
      last_name: "Biradar",
      password: "Asb@1999",
      username: "fgfgfg@mail.com",
    };
    const responsePOST = await request(app).post("/v1/user").send(req);
    expect(responsePOST.statusCode).toEqual(201);
    let token = `${req.username}:${req.password}`;
    let base64token = btoa(token);

    const responseCreateGET = await request(app)
      .get("/v1/user/self")
      .send(req)
      .set("Authorization", `Basic ${base64token}`);
    expect(responseCreateGET.statusCode).toEqual(200);
  });
});

describe("Integration Test 2 for Updating a user and Validating using GET", () => {
  test("PUT /v1/user/self - success - Update User", async () => {
    const username = "fgfgfg@mail.com";
    const password = "Asb@1999";
    let token2 = `${username}:${password}`;
    let base64token2 = btoa(token2);

    const reqUpdate = {
      first_name: "AAA",
      last_name: "BBB",
      password: "9423523985",
    };
    const responsePUT = await request(app)
      .put("/v1/user/self")
      .set("Authorization", `Basic ${base64token2}`)
      .send(reqUpdate);

    expect(responsePUT.statusCode).toEqual(204);

    let token3 = `${username}:${reqUpdate.password}`;
    let base64token3 = btoa(token3);

    const responseUpdateGET = await request(app)
      .get("/v1/user/self")
      .send()
      .set("Authorization", `Basic ${base64token3}`);
    expect(responseUpdateGET.statusCode).toEqual(200);
  });
});
