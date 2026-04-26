const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const User = sequelize.define("User", {
  name: DataTypes.STRING,
  email: {
    type: DataTypes.STRING,
    unique: true,
  },
  password: DataTypes.STRING,
  role: {
    type: DataTypes.ENUM("tutor", "guardian", "admin"),
    defaultValue: "tutor",
  },
  phone: DataTypes.STRING,
  department: DataTypes.STRING,
  studentId: DataTypes.STRING,
  gender: DataTypes.STRING,
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  otpCode: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  otpExpiry: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  profileViews: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
}, {
  defaultScope: {
    attributes: { exclude: ["password", "otpCode", "otpExpiry"] },
  },
  scopes: {
    withPassword: { attributes: {} }
  }
});

module.exports = User;
