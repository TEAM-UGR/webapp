const express = require("express");
const createDatabase = require("./config/createDB");
const initializeSequelize = require("./config/sequelizeConfig");
const User = require("./models/User");
const dbConfig = require("./config/dbConfig");

const databaseName = process.env.DATABASE;
const bootstrapDatabase = require("./config/sequelizeConfig.js");

const sequelize = initializeSequelize(databaseName);

const userAuthRouter = require("./routes/user.auth.js");

const app = express();
app.use(express.json());

app.use((req, res, next) => {
  const allowedBasePaths = ["/healthz", "/v1/user", "/v1/user/self"];
  const fullPath = req.originalUrl;

  const isAllowedPath = allowedBasePaths.some(
    (basePath) =>
      fullPath.startsWith(basePath) &&
      (fullPath.length === basePath.length ||
        fullPath[basePath.length] === "?" ||
        fullPath[basePath.length] === "/")
  );

  if (!isAllowedPath) {
    return res
      .status(400)
      .json({ error: "Bad Request: Invalid path or query parameters" });
  }

  next();
});

app.get("/healthz", async (req, res) => {
  if (Object.keys(req.query).length > 0 || req.headers["content-length"] > 0) {
    console.log("400 Bad Request");
    return res
      .status(400)
      .send()
      .header("Cache-Control", "no-cache, no-store, must-revalidate");
  }

  try {
    await sequelize.authenticate();
    console.log("Status: 200 OK - Database is up and running");
    return res
      .status(200)
      .header("Cache-Control", "no-cache, no-store, must-revalidate")
      .send();
  } catch (err) {
    console.error("Error during database health check");
    return res
      .status(503)
      .header("Cache-Control", "no-cache, no-store, must-revalidate")
      .send();
  }
});

app.all("/healthz", (req, res) => {
  return res
    .status(405)
    .send()
    .header("Cache-Control", "no-cache, no-store, must-revalidate");
});

const rejectAdditionalPathSegments = (expectedPaths) => {
  return (req, res, next) => {
    if (!expectedPaths.includes(req.path)) {
      return res.status(400).json({ error: "Bad Request" });
    }
    next();
  };
};

app.use("/healthz", rejectAdditionalPathSegments(["/healthz"]));

app.use(userAuthRouter);

app.listen(3000, () => {
  console.log("Application is running on http://localhost:3000");

  createDatabaseAndSyncModels();
});

async function createDatabaseAndSyncModels() {
  try {
    await createDatabase();
    await sequelize.sync();
    
    console.log("Database and models are ready.");
  } catch (error) {
    console.error("Failed to set up database and models:", error);
    process.exit(1);
  }
}
module.exports = app;
