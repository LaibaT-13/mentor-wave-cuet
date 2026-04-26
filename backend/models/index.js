const { sequelize } = require("../config/db");
const User = require("./User");
const TutorProfile = require("./TutorProfile");
const TuitionPost = require("./TuitionPost");
const Application = require("./Application");
const Message = require("./Message");

// 1. User & TutorProfile (1-to-1)
User.hasOne(TutorProfile, { foreignKey: "UserId", onDelete: "CASCADE" });
TutorProfile.belongsTo(User, { foreignKey: "UserId" });

// 2. User & TuitionPost (1-to-Many)
User.hasMany(TuitionPost, { foreignKey: "guardianId", onDelete: "CASCADE" });
TuitionPost.belongsTo(User, { as: "guardian", foreignKey: "guardianId" });

// 3. User & Application (1-to-Many)
User.hasMany(Application, { foreignKey: "tutorId", onDelete: "CASCADE" });
Application.belongsTo(User, { as: "tutor", foreignKey: "tutorId" });

// 4. TuitionPost & Application (1-to-Many)
TuitionPost.hasMany(Application, { onDelete: "CASCADE" });
Application.belongsTo(TuitionPost);

// 5. Message relationships
User.hasMany(Message, { foreignKey: "senderId", as: "sentMessages", onDelete: "CASCADE" });
User.hasMany(Message, { foreignKey: "receiverId", as: "receivedMessages", onDelete: "CASCADE" });
Message.belongsTo(User, { as: "sender", foreignKey: "senderId" });
Message.belongsTo(User, { as: "receiver", foreignKey: "receiverId" });

const syncDB = async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log("✅ Database synced successfully.");
  } catch (err) {
    console.error("❌ Database sync failed:", err.message);
  }
};

module.exports = {
  User, TutorProfile, TuitionPost, Application, Message, syncDB, sequelize
};
