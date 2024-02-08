const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const User = require("../models/User");

router.use(express.json());

const validateUserCreation = (req, res, next) => {
  const { first_name, last_name, password, username, ...extraFields } =
    req.body;
  const requiredFields = ["first_name", "last_name", "password", "username"];

  const missingFields = requiredFields.filter(
    (field) => !req.body.hasOwnProperty(field)
  );
  if (missingFields.length > 0) {
    return res.status(400).header("Cache-Control", "no-cache, no-store, must-revalidate").json({
      error: `Please provide  : ${missingFields.join(", ")}`,
    });
  }

  const extraFieldNames = Object.keys(extraFields);
  if (extraFieldNames.length > 0) {
    return res.status(400).header("Cache-Control", "no-cache, no-store, must-revalidate").json({ error: `Extra fields are not allowed` });
  }

  next();
};

router.post("/v1/user", validateUserCreation, async (req, res) => {
  const basePath = "/v1/user";
  const fullPath = req.originalUrl; 


  if (!fullPath.startsWith(basePath) || fullPath.length > basePath.length) {
    return res
      .status(400).header("Cache-Control", "no-cache, no-store, must-revalidate")
      .json({ error: "Bad Request: Invalid path or query parameters" });
  }
  try {
    const { first_name, last_name, password, username } = req.body;

    const existingUser = await User.findOne({
      where: {
        username: username,
      },
    });

    if (existingUser) {
      return res
        .status(400).header("Cache-Control", "no-cache, no-store, must-revalidate")
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
    });

    const { password: _, ...userData } = user.toJSON();
    res.status(201).header("Cache-Control", "no-cache, no-store, must-revalidate").json(userData);
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(555).header("Cache-Control", "no-cache, no-store, must-revalidate").json({ error: "Internal creating error" });
  }
});

router.all("/v1/user", (req, res) => {
  res.status(405).header("Cache-Control", "no-cache, no-store, must-revalidate").json({ error: "Method Not Allowed" });
});

const basicAuth = async (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Basic ")) {
    return res
      .status(401).header("Cache-Control", "no-cache, no-store, must-revalidate")
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
      return res.status(401).header("Cache-Control", "no-cache, no-store, must-revalidate").json({ error: "Invalid username or password" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).header("Cache-Control", "no-cache, no-store, must-revalidate").json({ error: "Invalid username or password" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(555).header("Cache-Control", "no-cache, no-store, must-revalidate").json({ error: "Auth Error" });
  }
};

router.use((req, res, next) => {
  // Allowed base path
  const basePath = "/v1/user/self";
  const fullPath = req.originalUrl; 


  if (!fullPath.startsWith(basePath) || fullPath.length > basePath.length) {
    return res
      .status(400).header("Cache-Control", "no-cache, no-store, must-revalidate")
      .json({ error: "jkdsvfn Bad Request: Invalid path or query parameters" });
  }

  next();
});

router.get("/v1/user/self", basicAuth, async (req, res) => {
  const {
    id,
    first_name,
    last_name,
    username,
    account_created,
    account_updated,
  } = req.user;
  res.status(200).header("Cache-Control", "no-cache, no-store, must-revalidate").json({
    id,
    first_name,
    last_name,
    username,
    account_created,
    account_updated,
  });
});

const validateUserUpdate = (req, res, next) => {
  const { first_name, last_name, password, ...extraFields } = req.body;
  const allowedFields = ["first_name", "last_name", "password"];

  const extraFieldNames = Object.keys(extraFields);
  if (extraFieldNames.length > 0) {
    return res.status(400).header("Cache-Control", "no-cache, no-store, must-revalidate").json({
      error: `Extra fields are not allowed!!`,
    });
  }

  if (!first_name && !last_name && !password) {
    return res.header("Cache-Control", "no-cache, no-store, must-revalidate").status(400).json({
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
      console.error("Error hashing password:", error);
      return res
        .status(500).header("Cache-Control", "no-cache, no-store, must-revalidate")
        .json({ error: "Internal server error during password hashing" });
    }
  }

  try {
    const userId = req.user.id;

    const [updated] = await User.update(updateData, {
      where: { id: userId },
    });

    if (updated) {
      return res.status(204).header("Cache-Control", "no-cache, no-store, must-revalidate").send();
    } else {
      return res.status(404).header("Cache-Control", "no-cache, no-store, must-revalidate").send("Rows not updated");
    }
  } catch (error) {
    console.error("Error updating user:", error);
    return res.status(555).header("Cache-Control", "no-cache, no-store, must-revalidate").json({ error: "Failed to update" });
  }
});

router.all("/v1/user/self", (req, res) => {
  res.status(405).header("Cache-Control", "no-cache, no-store, must-revalidate").json({ error: "Method Not Allowed" });
});

module.exports = router;
