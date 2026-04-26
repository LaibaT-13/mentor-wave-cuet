const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Application = sequelize.define("Application", {
  message: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM("pending", "accepted", "rejected"),
    defaultValue: "pending",
  },
});

module.exports = Application;