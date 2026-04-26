const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const TuitionPost = sequelize.define("TuitionPost", {
  title: { type: DataTypes.STRING, allowNull: false },
  class: { type: DataTypes.STRING, allowNull: false },
  subjects: { type: DataTypes.STRING, allowNull: false },
  location: { type: DataTypes.STRING, allowNull: false },
  salary: { type: DataTypes.INTEGER, defaultValue: 0 },
  days: { type: DataTypes.INTEGER, defaultValue: 0 },
  description: { type: DataTypes.TEXT },
  status: {
    type: DataTypes.ENUM("open", "closed"),
    defaultValue: "open",
  },
  // Admin approval fields
  approvalStatus: {
    type: DataTypes.ENUM("pending", "approved", "declined"),
    defaultValue: "pending",
  },
  declineReason: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
});

module.exports = TuitionPost;
