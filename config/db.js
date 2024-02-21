const { Sequelize } = require("sequelize");
require('dotenv').config(); 


const sequelize = new Sequelize(process.env.DATABASE, process.env.DB_USER, process.env.PASSWORD, {
  host: process.env.HOST,
  dialect: "mysql",
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
    throw new Error(error.message);
  }
};

module.exports = {connectDB , sequelize};