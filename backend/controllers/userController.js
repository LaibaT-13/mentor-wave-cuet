const { User, TutorProfile } = require("../models");

exports.getProfile = async (req, res) => {
  try {
    // We "include" the TutorProfile so we see bio/subjects in the same response
    const user = await User.findByPk(req.user.id, {
      include: [{ model: TutorProfile }]
    });
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateTutorProfile = async (req, res) => {
  try {
    const { subjects, location, bio } = req.body;
    const userId = req.user.id; // Extracted from the JWT token by authMiddleware

    // findOrCreate handles both new users and existing profile updates
    const [profile, created] = await TutorProfile.findOrCreate({
      where: { UserId: userId },
      defaults: { subjects, location, bio }
    });

    if (!created) {
      // If profile already existed, update with new info provided in req.body
      if (subjects) profile.subjects = subjects;
      if (location) profile.location = location;
      if (bio) profile.bio = bio;
      await profile.save();
    }

    res.json({ 
      message: created ? "Tutor profile created!" : "Tutor profile updated!", 
      profile 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// View a tutor's public profile (guardian action) — increments view count
exports.viewTutorProfile = async (req, res) => {
  try {
    const tutorId = req.params.id;

    // Increment view count (don't count self-views)
    if (parseInt(tutorId) !== req.user.id) {
      await User.increment("profileViews", { where: { id: tutorId } });
    }

    const user = await User.findByPk(tutorId, {
      include: [{ model: TutorProfile }],
      attributes: { exclude: ["password", "otpCode", "otpExpiry"] },
    });

    if (!user || user.role !== "tutor") {
      return res.status(404).json({ message: "Tutor not found." });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
