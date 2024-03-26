const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const { User } = require("../models/User");
const logger = require("../config/logger");
const { log, error } = require("winston");
const pub = require("../config/pubsub");

router.use(express.json());

const validateUserCreation = (req, res, next) => {
  const { first_name, last_name, password, username, ...extraFields } =
    req.body;
  const requiredFields = ["first_name", "last_name", "password", "username"];

  const missingFields = requiredFields.filter(
    (field) => !req.body.hasOwnProperty(field)
  );
  if (missingFields.length > 0) {
    // logger.error("Some fields are missing");
    logger.error({
      id: null,
      message: "Some fields are missing",
      missingFields: `${missingFields.join(", ")}`,
      request_method: req.method,
    });
    return res
      .status(400)
      .header("Cache-Control", "no-cache, no-store, must-revalidate")
      .json({
        error: `Please provide  : ${missingFields.join(", ")}`,
      });
  }

  const extraFieldNames = Object.keys(extraFields);
  if (extraFieldNames.length > 0) {
    // logger.error("Request body has extra fields");
    logger.warn({
      id: null,
      log_payload: "Request body has extra fields",
      extraFields: extraFieldNames,
      request_method: req.method,
    });
    return res
      .status(400)
      .header("Cache-Control", "no-cache, no-store, must-revalidate")
      .json({ error: `Extra fields are not allowed` });
  }
  next();
};

router.post("/v1/user", validateUserCreation, async (req, res) => {
  const basePath = "/v1/user";
  const fullPath = req.originalUrl;

  if (!fullPath.startsWith(basePath) || fullPath.length > basePath.length) {
    // logger.error("Invalid endpoint");
    logger.error({
      id: null,
      message: "Invalid end point",
      request_method: req.method,
      endpoint: req.baseUrl,
    });
    return res
      .status(400)
      .header("Cache-Control", "no-cache, no-store, must-revalidate")
      .json({ error: "Bad Request: Invalid path or query parameters" });
  }
  try {
    const { first_name, last_name, password, username } = req.body;

    const existingUser = await User.findOne({
      where: {
        username: username,
      },
    });

    if (!password) {
      // logger.error("Password field empty!!!Please enter a password");
      logger.error({
        id: null,
        message: "Password field empty!!!Please enter a password",
        request_method: req.method,
        status: 400,
        status_message: "Bad Request",
      });
      return res
        .status(400)
        .header("Cache-Control", "no-cache, no-store, must-revalidate")
        .json({ error: "Password field empty!!!Please enter a password" });
    }

    if (existingUser) {
      // logger.error("User with this email already exists",existingUser.dataValues.id);
      logger.error({
        message: "User with this email already exists",
        user_id: existingUser.dataValues.id,
        status: 400,
        status_message: "Bad Request",
      });
      console.log(existingUser.dataValues.id);
      return res
        .status(400)
        .header("Cache-Control", "no-cache, no-store, must-revalidate")
        .json({ error: "User with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      first_name,
      last_name,
      username,
      password: hashedPassword,
      account_created: new Date().toISOString(),
      account_updated: new Date().toISOString(),
      token_expiry: new Date(Date.now() + 2 * 60000).toISOString(),
    });

    const { password: _, ...userData } = user.toJSON();

    await pub(
      JSON.stringify(userData),
      // "userData.id",
      "development-414823",
      "verify_email",
      "webapp-subscription"
    );

    logger.info({
      id: userData.id,
      message: "Succesfully created new User",
      status: 201,
      request_method: req.method,
    });

    logger.warn({
      id: null,
      message:
        "Account created and account updated fields will not be updated if the values are passed though the request body",
    });

    return res
      .status(201)
      .header("Cache-Control", "no-cache, no-store, must-revalidate")
      .json(userData);
    // logger.info("Succesfully created new User", User.id);

    // const userCreated = {
    //   first_name: userData.first_name,
    //   last_name: userData.last_name,
    //   username: userData.username
    // }
  } catch (error) {
    logger.error("Error creating user");
    console.log("Error creating user:", error);
    res
      .status(555)
      .header("Cache-Control", "no-cache, no-store, must-revalidate")
      .json({ error: "Internal creating error" });
  }
});

router.get(`/v1/user/self/:token`, async (req, res) => {
  try {
    let token = req.params.token;
    if (!token) {
      throw new Error("Token not found");
    }
    const user = await User.findOne({ where: { token } });
    if (!user) {
    }
    let time = new Date();
    if (time > user.token_expiry) {
      throw new Error("Token is expired");
    }

    user.verification_status = true;
    await user.save();

    res.status(200).json({ message: "User verified" });
  } catch (error) {
    console.log("Error verifying user:", error);
    res
      .status(401)
      .header("Cache-Control", "no-cache, no-store, must-revalidate")
      .json({ error: "Internal creating error" });
  }
});

router.all("/v1/user", (req, res) => {
  logger.error("Method Not Allowed");
  res
    .status(405)
    .header("Cache-Control", "no-cache, no-store, must-revalidate")
    .json({ error: "Method Not Allowed" });
});

const basicAuth = async (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Basic ")) {
    console.log("/n/n/n/n AUTH /n/n/n/n/n");
    return res
      .status(401)
      .header("Cache-Control", "no-cache, no-store, must-revalidate")
      .json({ error: "Missing or invalid Authorization header" });
  }

  const base64Credentials = authHeader.split(" ")[1];
  const credentials = Buffer.from(base64Credentials, "base64").toString(
    "ascii"
  );
  const [username, password] = credentials.split(":");

  try {
    const user = await User.findOne({
      where: { username },
    });

    if (!user) {
      console.log("/n/n/n/n USER /n/n/n/n/n");
      logger.error("Invalid Username or password");
      return res
        .status(401)
        .header("Cache-Control", "no-cache, no-store, must-revalidate")
        .json({ error: "Invalid username or password" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      console.log("/n/n/n/n PASSWORD /n/n/n/n/n");
      logger.error("Invalid Username or password");
      return res
        .status(401)
        .header("Cache-Control", "no-cache, no-store, must-revalidate")
        .json({ error: "Invalid username or password" });
    }
    // Logic to check if user verified is true

    req.user = user;
    next();
  } catch (error) {
    logger.error("Authentication error");
    console.error("Authentication error:", error);
    return res
      .status(555)
      .header("Cache-Control", "no-cache, no-store, must-revalidate")
      .json({ error: "Auth Error" });
  }
};

router.use((req, res, next) => {
  const basePath = "/v1/user/self";
  const fullPath = req.originalUrl;

  if (!fullPath.startsWith(basePath) || fullPath.length > basePath.length) {
    // logger.error("Bad Request: Invalid path or query parameters");
    logger.error({
      id: null,
      message: `Invalid endpoint!!  End point used is : ${fullPath}`,
    });
    return res
      .status(400)
      .header("Cache-Control", "no-cache, no-store, must-revalidate")
      .json({ error: "Bad Request: Invalid path or query parameters" });
  }
  next();
});

router.get("/v1/user/self", basicAuth, async (req, res) => {
  const user = await User.findOne({ where: { token } });
  if(user.verification_status == true){
    const {
      id,
      first_name,
      last_name,
      username,
      account_created,
      account_updated,
    } = req.user;
    // logger.info("Succesfull GET request");
    logger.info({
      id: id,
      message: "Succesfull GET Request",
      request_method: req.method,
      status: 200,
      status_message: "OK",
    });
    return res
      .status(200)
      .header("Cache-Control", "no-cache, no-store, must-revalidate")
      .json({
        id,
        first_name,
        last_name,
        username,
        account_created,
        account_updated,
      });
  }
  return res
      .status(400)
      .header("Cache-Control", "no-cache, no-store, must-revalidate")
      .json({
        error: `User not verified`,
      }); 
  
});

const validateUserUpdate = (req, res, next) => {
  const { first_name, last_name, password, ...extraFields } = req.body;
  const allowedFields = ["first_name", "last_name", "password"];

  const extraFieldNames = Object.keys(extraFields);
  if (extraFieldNames.length > 0) {
    // logger.error("Found extra fields while updating user");
    logger.error({
      id: null,
      message: `Found extra fields . Extra fields are: ${extraFieldNames} `,
      status: 400,
      request_method: req.method,
    });
    return res
      .status(400)
      .header("Cache-Control", "no-cache, no-store, must-revalidate")
      .json({
        error: `Extra fields are not allowed!!`,
      });
  }

  if (!first_name && !last_name && !password) {
    // logger.error("Missing fields while trying to get user");
    logger.error({
      id: null,
      message: "Missing fields while updating user.",
      status: 400,
      status_message: "Bad Request",
      request_method: req.method,
    });
    return res
      .header("Cache-Control", "no-cache, no-store, must-revalidate")
      .status(400)
      .json({
        error: "Misssing fields : first_name, last_name, or password",
      });
  }

  next();
};

router.put("/v1/user/self", basicAuth, validateUserUpdate, async (req, res) => {
  const { first_name, last_name, password } = req.body;
  const updateData = {};

  if (first_name) updateData.first_name = first_name;
  if (last_name) updateData.last_name = last_name;

  if (password) {
    try {
      updateData.password = await bcrypt.hash(password, 10);
    } catch (error) {
      // logger.error("Error while password hashing");
      logger.error({
        id: null,
        message: "Error while password hashing",
        status: 500,
        status_message: "Internal server error during password hashing",
      });
      console.error("Error hashing password:", error);
      return res
        .status(500)
        .header("Cache-Control", "no-cache, no-store, must-revalidate")
        .json({ error: "Internal server error during password hashing" });
    }
  }

  try {
    const userId = req.user.id;

    const [updated] = await User.update(updateData, {
      where: { id: userId },
    });

    if (updated) {
      // logger.info("User was updated succesfully");
      logger.info({
        id: userId,
        message: "User updated succesfully",
        status: 204,
        status_message: "No Content",
      });
      return res
        .status(204)
        .header("Cache-Control", "no-cache, no-store, must-revalidate")
        .send();
    } else {
      // logger.error("Failed to update User");
      logger.error({
        id: null,
        message: "Failed to update user",
        status: 404,
        status_message: "User not updated",
      });
      return res
        .status(404)
        .header("Cache-Control", "no-cache, no-store, must-revalidate")
        .send("User not updated");
    }
  } catch (error) {
    // logger.error("An error occured while updating user");
    logger.error({
      id: null,
      message: "An error occured while updating user",
      status: 555,
      status_message: "Failed to update",
    });
    console.error("Error updating user:", error);
    return res
      .status(555)
      .header("Cache-Control", "no-cache, no-store, must-revalidate")
      .json({ error: "Failed to update" });
  }
});

router.all("/v1/user/self", (req, res) => {
  // logger.error(    "Method not allowed: Trying to make a request that is forbidden");
  logger.error({
    id: null,
    message: "Method not allowed: Trying to make a request that is forbidden",
    request_method: req.method,
  });
  res
    .status(405)
    .header("Cache-Control", "no-cache, no-store, must-revalidate")
    .json({ error: "Method Not Allowed" });
});

module.exports = router;
