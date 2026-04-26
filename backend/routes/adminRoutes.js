const router = require("express").Router();
const protect = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const { User, TuitionPost, Application } = require("../models");
const { Op } = require("sequelize");

router.use(protect, roleMiddleware("admin"));

// Stats
router.get("/stats", async (req, res) => {
  try {
    const [tutors, guardians, posts, applications, pendingUsers, pendingPosts] = await Promise.all([
      User.count({ where: { role: "tutor", isVerified: true } }),
      User.count({ where: { role: "guardian", isVerified: true } }),
      TuitionPost.count({ where: { approvalStatus: "approved" } }),
      Application.count(),
      User.count({ where: { isVerified: false, role: { [Op.in]: ["tutor", "guardian"] } } }),
      TuitionPost.count({ where: { approvalStatus: "pending" } }),
    ]);
    res.json({ tutors, guardians, posts, applications, pendingUsers, pendingPosts });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// All users
router.get("/users", async (req, res) => {
  try {
    const users = await User.findAll({ order: [["createdAt", "DESC"]] });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Only tutors
router.get("/tutors", async (req, res) => {
  try {
    const users = await User.findAll({ where: { role: "tutor" }, order: [["createdAt", "DESC"]] });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Only guardians
router.get("/guardians", async (req, res) => {
  try {
    const users = await User.findAll({ where: { role: "guardian" }, order: [["createdAt", "DESC"]] });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Pending user verifications (tutors + guardians not yet verified)
router.get("/pending", async (req, res) => {
  try {
    const users = await User.findAll({
      where: { isVerified: false, role: { [Op.in]: ["tutor", "guardian"] } },
      order: [["createdAt", "DESC"]],
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Pending tuition posts awaiting admin approval
router.get("/posts/pending", async (req, res) => {
  try {
    const posts = await TuitionPost.findAll({
      where: { approvalStatus: "pending" },
      include: [{ model: User, as: "guardian", attributes: ["id", "name", "email"] }],
      order: [["createdAt", "DESC"]],
    });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// All tuition posts
router.get("/posts/all", async (req, res) => {
  try {
    const posts = await TuitionPost.findAll({
      include: [{ model: User, as: "guardian", attributes: ["id", "name", "email"] }],
      order: [["createdAt", "DESC"]],
    });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Approve a tuition post
router.patch("/posts/:id/approve", async (req, res) => {
  try {
    await TuitionPost.update(
      { approvalStatus: "approved", declineReason: null },
      { where: { id: req.params.id } }
    );
    res.json({ message: "Post approved successfully." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Decline a tuition post (with reason)
router.patch("/posts/:id/decline", async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason || !reason.trim()) {
      return res.status(400).json({ message: "Please provide a reason for declining." });
    }
    await TuitionPost.update(
      { approvalStatus: "declined", declineReason: reason.trim() },
      { where: { id: req.params.id } }
    );
    res.json({ message: "Post declined." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Verify (accept) a user account
router.patch("/users/:id/verify", async (req, res) => {
  try {
    await User.update(
      { isVerified: true, otpCode: null, otpExpiry: null },
      { where: { id: req.params.id } }
    );
    res.json({ message: "User verified successfully." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete user
router.delete("/users/:id", async (req, res) => {
  try {
    await User.destroy({ where: { id: req.params.id } });
    res.json({ message: "User deleted successfully." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete a post
router.delete("/posts/:id", async (req, res) => {
  try {
    await TuitionPost.destroy({ where: { id: req.params.id } });
    res.json({ message: "Post deleted." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
