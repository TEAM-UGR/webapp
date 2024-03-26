const { DataTypes } = require("sequelize");
require("dotenv").config();

const { sequelize } = require("../config/db");

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    first_name: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "first_name",
    },
    last_name: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "last_name",
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "username",
    },
    token: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "token",
      defaultValue: DataTypes.UUIDV4,
    },
    verification_status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      field: "verification_status",
      defaultValue: false,
    },
    verification_email_status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      field: "verification_email_status",
      defaultValue: false,
    },
    token_expiry: {
      type: DataTypes.DATE,
      field: "token_expiry"
    },
  },
  {
    tableName: "users",
    timestamps: true,
    createdAt: "account_created",
    updatedAt: "account_updated",
  }
);
const syncModels = async () => {
  try {
    await sequelize.sync({ force: false });
    console.log("Try block of syncModels")
  } catch (err) {
    console.log("Error while syncing");
  }
};

module.exports = { User, syncModels };
