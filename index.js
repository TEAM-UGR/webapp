const express = require("express");


const logger = require("./config/logger.js")
const userAuthRouter = require("./routes/user.auth.js");
const  startupDB  = require("./config/startupDatabase.js");

const { sequelize } = require("./config/db.js")

const app = express();
app.use(express.json());

const startUp = async () => {
  await startupDB();
} 

startUp(); 

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
    logger.error("Bad request: Invalid endpoint or query parameters")
    return res
      .status(400)
      .json({ error: "Bad Request: Invalid path or query parameters" });
  }

  next();
});

app.get("/healthz", async (req, res) => {
  if (Object.keys(req.query).length > 0 || req.headers["content-length"] > 0) {
    logger.error("Bad request: Has invalid query parameters or contains request payload")
    console.log("400 Bad Request");
    return res
      .status(400)
      .send()
      .header("Cache-Control", "no-cache, no-store, must-revalidate");
  }

  try {
    await sequelize.authenticate();
    console.log("Status: 200 OK - Database is up and running");
    logger.info("Database is up and running")
    return res
      .status(200)
      .header("Cache-Control", "no-cache, no-store, must-revalidate")
      .send();
  } catch (err) {
    console.error("Error during database health check");
    logger.error("Error during database health check")
    return res
      .status(503)
      .header("Cache-Control", "no-cache, no-store, must-revalidate")
      .send();
  }
});

app.all("/healthz", (req, res) => {
  logger.error("Bad Request: Method not allowed")
  return res
    .status(405)
    .send()
    .header("Cache-Control", "no-cache, no-store, must-revalidate");
});

const rejectAdditionalPathSegments = (expectedPaths) => {
  return (req, res, next) => {
    if (!expectedPaths.includes(req.path)) {
      logger.error("Invalid Endpoint")
      return res.status(400).json({ error: "Bad Request" });
    }
    next();
  };
};

app.use("/healthz", rejectAdditionalPathSegments(["/healthz"]));

app.use(userAuthRouter);

app.listen(3000, () => {
  logger.info("Application is up and Running")
  console.log("Application is up and running");

  // createDatabaseAndSyncModels();
});

async function createDatabaseAndSyncModels() {
  try {
    await createDatabase();
    await sequelize.sync();
    logger.info("Databse and models/schema are ready")
    console.log("Database and models are ready.");
  } catch (error) {
    logger.error("Failed to set up database and models/schema")
    console.error("Failed to set up database and models:", error);
    process.exit(1);
  }
}
module.exports = app;
