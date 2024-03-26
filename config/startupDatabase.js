const mysql = require("mysql2/promise");
const { connectDB, sequelize } = require("./db.js");
const { syncModels } = require("../models/User.js");
require("dotenv").config();

const startupDB = async () => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.HOST,
      user: process.env.DB_USER,
      password: process.env.PASSWORD,
      connectTimeout: 20000,
    });

    await connection.query(
      `CREATE DATABASE IF NOT EXISTS ${process.env.DATABASE}`
    );
    await createSchema();
  } catch (err) {
    console.log("Error while Starting up DB", err.message);
    throw new Error(err);
  }
};

const createSchema = async () => {
  try {
    await connectDB();
    await syncModels();
    await sequelize.sync({ alter: true });
    console.log("Synced Models successfully");
  } catch (err) {
    console.log("Failed to sync models");
  }
};

module.exports = startupDB;
