const mysql = require("mysql2/promise");
require("dotenv").config();

const createDatabase = async () => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.HOST,
      user: process.env.USER,
      password: process.env.PASSWORD,
      
    });

    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${process.env.DATABASE}\`;`
    );
    console.log(`Database ${process.env.DATABASE} is ready.`);
    await connection.end();
  } catch (error) {
    console.error("Unable to create database");
    throw error;
  }
};

module.exports = createDatabase;
