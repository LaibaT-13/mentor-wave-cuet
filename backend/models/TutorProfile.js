const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const TutorProfile = sequelize.define("TutorProfile", {
  subjects: DataTypes.STRING,
  location: DataTypes.STRING,
  bio: DataTypes.TEXT,
});

module.exports = TutorProfile;