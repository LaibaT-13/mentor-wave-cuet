const router = require("express").Router();
const protect = require("../middleware/authMiddleware");
const { 
  applyToTuition, 
  getApplicationsForPost, 
  updateApplicationStatus 
} = require("../controllers/applicationController");

// Apply to a post (Tutor action)
router.post("/apply/:tuitionId", protect, applyToTuition);

// See who applied to a post (Guardian action)
router.get("/post/:tuitionId", protect, getApplicationsForPost);

// Accept or Reject an application (Guardian action)
// We use PATCH because we are only updating part of the data (the status)
router.patch("/status/:applicationId", protect, updateApplicationStatus);

module.exports = router;
const { getMyApplications, getRecentApplicants } = require("../controllers/applicationController");
// Tutor's own applications
router.get("/my", protect, getMyApplications);
// Guardian: recent applicants across all posts
router.get("/recent", protect, getRecentApplicants);
