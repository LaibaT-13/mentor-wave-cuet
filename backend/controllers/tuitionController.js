const { TuitionPost, User } = require("../models");

// Guardian creates a post — starts as "pending" approval
exports.createTuition = async (req, res) => {
  try {
    const post = await TuitionPost.create({
      ...req.body,
      guardianId: req.user.id,
      approvalStatus: "pending",
    });
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Tutors browse — only show admin-approved posts
exports.getAllTuition = async (req, res) => {
  try {
    const posts = await TuitionPost.findAll({
      where: { status: "open", approvalStatus: "approved" },
      include: [{ model: User, as: "guardian", attributes: ["id", "name", "email"] }],
      order: [["createdAt", "DESC"]],
    });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Guardian's own posts (all statuses)
exports.getMyTuitions = async (req, res) => {
  try {
    const posts = await TuitionPost.findAll({
      where: { guardianId: req.user.id },
      order: [["createdAt", "DESC"]],
    });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete a tuition post
exports.deleteTuition = async (req, res) => {
  try {
    const post = await TuitionPost.findByPk(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found." });
    if (post.guardianId !== req.user.id) return res.status(403).json({ message: "Not authorized." });
    await post.destroy();
    res.json({ message: "Post deleted." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
