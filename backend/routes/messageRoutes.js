const router = require("express").Router();
const protect = require("../middleware/authMiddleware");
const { sendMessage, getConversations, getMessagesWith } = require("../controllers/messageController");

router.post("/",                protect, sendMessage);
router.get("/conversations",    protect, getConversations);
router.get("/with/:userId",     protect, getMessagesWith);

module.exports = router;
