const { Application, TuitionPost, User } = require("../models");

// 1. Tutor applies for a tuition
exports.applyToTuition = async (req, res) => {
  try {
    const { tuitionId } = req.params;
    const { message } = req.body;
    const tutorId = req.user.id;

    const post = await TuitionPost.findByPk(tuitionId);
    if (!post) {
      return res.status(404).json({ message: "Tuition post not found" });
    }

    if (post.guardianId === tutorId) {
      return res.status(400).json({ message: "You cannot apply to your own post!" });
    }

    const existingApp = await Application.findOne({
      where: { tutorId, TuitionPostId: tuitionId }
    });

    if (existingApp) {
      return res.status(400).json({ message: "You have already applied for this tuition." });
    }

    const application = await Application.create({
      message,
      tutorId,
      TuitionPostId: tuitionId
    });

    res.status(201).json({ message: "Application submitted successfully!", application });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 2. Get applications for a specific post (For the Guardian)
exports.getApplicationsForPost = async (req, res) => {
  try {
    const { tuitionId } = req.params;
    
    const applications = await Application.findAll({
      where: { TuitionPostId: tuitionId },
      include: [{ 
        model: User, 
        as: "tutor", 
        attributes: ["name", "email"] 
      }]
    });

    res.json(applications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 3. Guardian accepts or rejects an application (NEW)
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status } = req.body; // Expecting "accepted" or "rejected"
    const guardianId = req.user.id;

    // We include the TuitionPost so we can check who the owner is
    const application = await Application.findByPk(applicationId, {
      include: [{ model: TuitionPost }]
    });

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    // Security check: Only the Guardian who created the post can update application status
    if (application.TuitionPost.guardianId !== guardianId) {
      return res.status(403).json({ message: "You are not authorized to update this application." });
    }

    application.status = status;
    await application.save();

    // If the tutor is accepted, we automatically close the post
    if (status === "accepted") {
      await TuitionPost.update(
        { status: "closed" },
        { where: { id: application.TuitionPostId } }
      );
    }

    res.json({ message: `Application ${status} successfully!`, application });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// 4. Tutor's own applications
exports.getMyApplications = async (req, res) => {
  try {
    const apps = await Application.findAll({
      where: { tutorId: req.user.id },
      include: [{ model: TuitionPost, include: [{ model: User, as: "guardian", attributes: ["name","email"] }] }],
      order: [["createdAt", "DESC"]],
    });
    res.json(apps);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 5. Guardian: recent applicants across all their posts
exports.getRecentApplicants = async (req, res) => {
  try {
    const posts = await TuitionPost.findAll({ where: { guardianId: req.user.id }, attributes: ["id"] });
    const postIds = posts.map(p => p.id);
    if (!postIds.length) return res.json([]);

    const { Op } = require("sequelize");
    const apps = await Application.findAll({
      where: { TuitionPostId: { [Op.in]: postIds } },
      include: [
        { model: User, as: "tutor", attributes: ["id","name","email","department"] },
        { model: TuitionPost, attributes: ["id","title"] },
      ],
      order: [["createdAt", "DESC"]],
      limit: 10,
    });
    res.json(apps);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
