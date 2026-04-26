const router = require("express").Router();
const protect = require("../middleware/authMiddleware");
const { getProfile, updateTutorProfile, viewTutorProfile } = require("../controllers/userController");

// Fetch own profile
router.get("/profile", protect, getProfile);

// Create or Update Tutor details
router.post("/profile/tutor", protect, updateTutorProfile);

// View any tutor's public profile (increments view count)
router.get("/profile/tutor/:id", protect, viewTutorProfile);

module.exports = router;
