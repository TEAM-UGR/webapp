const mysql = require("mysql2/promise");
const dbConfig = require("./dbConfig");
require("dotenv").config();




const createDatabase = async () => {
  try {
    const connection = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password,
    });

    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\`;`
    );
    console.log(`Database ${dbConfig.database} is ready.`);
    await connection.end();
  } catch (error) {
    console.error("Unable to create database");
    throw error;
  }
};

module.exports = createDatabase;
