const router = require("express").Router();
const protect = require("../middleware/authMiddleware");
const { createTuition, getAllTuition, getMyTuitions, deleteTuition } = require("../controllers/tuitionController");

router.post("/", protect, createTuition);
router.get("/", protect, getAllTuition);
router.get("/my", protect, getMyTuitions);
router.delete("/:id", protect, deleteTuition);

module.exports = router;
