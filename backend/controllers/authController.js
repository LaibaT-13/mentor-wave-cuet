const bcrypt = require("bcryptjs");
const { User } = require("../models");
const generateToken = require("../utils/generateToken");
const sendEmail = require("../utils/sendEmail");

const isValidCUETEmail = (email) => /^u\d{7}@student\.cuet\.ac\.bd$/.test(email);

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// REGISTER
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (role === "admin") {
      return res.status(403).json({ message: "Admin registration is restricted." });
    }
    if (role === "tutor" && !isValidCUETEmail(email)) {
      return res.status(400).json({
        message: "Tutors must use a valid CUET email (u*******@student.cuet.ac.bd)."
      });
    }

    const existing = await User.scope("withPassword").findOne({ where: { email } });
    if (existing && existing.isVerified) {
      return res.status(400).json({ message: "This email is already registered and verified." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 15 * 60 * 1000);

    if (existing && !existing.isVerified) {
      await User.update(
        { name, password: hashedPassword, role: role || "tutor", otpCode: otp, otpExpiry },
        { where: { email } }
      );
    } else {
      const { studentId, department, phone, gender } = req.body;
      await User.create({
        name, email, password: hashedPassword,
        role: role || "tutor",
        isVerified: false,
        otpCode: otp,
        otpExpiry,
        ...(studentId && { studentId }),
        ...(department && { department }),
        ...(phone && { phone }),
        ...(gender && { gender }),
      });
    }

    // Always log OTP to terminal (useful for development)
    console.log(`\n📧 OTP for ${email}: ${otp}\n`);

    // Try sending email
    try {
      const firstName = name.split(" ")[0];
      await sendEmail(
        email,
        "Mentor Wave CUET — Email Verification Code",
        `Dear ${firstName},\n\nThis is the verification code: ${otp}\n\nBest regards,\nMentor Wave CUET`
      );
      console.log(`✅ Verification email sent to ${email}`);
      return res.status(201).json({
        message: "Verification code sent to your email.",
        email,
      });
    } catch (emailErr) {
      console.error(`❌ Email send failed: ${emailErr.message}`);
      // Registration succeeded — just email failed
      // Return devOtp so frontend can show "Show Demo Code"
      return res.status(201).json({
        message: "Registered! Email could not be sent — use the demo code below.",
        email,
        devOtp: otp,
        emailError: emailErr.message,
      });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// VERIFY OTP
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.scope("withPassword").findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: "No account found with this email." });
    if (user.isVerified) return res.status(400).json({ message: "Account already verified. Please login." });

    if (!user.otpCode || user.otpCode !== String(otp).trim()) {
      return res.status(400).json({ message: "Invalid verification code. Please try again." });
    }
    if (new Date() > new Date(user.otpExpiry)) {
      return res.status(400).json({ message: "Code has expired. Click Resend to get a new one." });
    }

    await User.update(
      { isVerified: true, otpCode: null, otpExpiry: null },
      { where: { email } }
    );

    const verified = await User.findOne({ where: { email } });
    const token = generateToken(verified);

    res.json({ message: "Email verified successfully!", user: verified.toJSON(), token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// RESEND OTP
exports.resendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.scope("withPassword").findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: "No account found with this email." });
    if (user.isVerified) return res.status(400).json({ message: "Account already verified." });

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 15 * 60 * 1000);
    await User.update({ otpCode: otp, otpExpiry }, { where: { email } });

    console.log(`\n📧 Resend OTP for ${email}: ${otp}\n`);

    try {
      const resendUser = await User.scope("withPassword").findOne({ where: { email } });
      const resendName = resendUser ? resendUser.name.split(" ")[0] : "User";
      await sendEmail(
        email,
        "Mentor Wave CUET — New Verification Code",
        `Dear ${resendName},\n\nThis is your new verification code: ${otp}\n\nBest regards,\nMentor Wave CUET`
      );
      res.json({ message: "New verification code sent to your email." });
    } catch (emailErr) {
      console.error(`❌ Resend email failed: ${emailErr.message}`);
      res.json({
        message: "Email could not be sent. Use the demo code.",
        devOtp: otp,
        emailError: emailErr.message,
      });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.scope("withPassword").findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: "No account found with this email." });

    if (!user.isVerified) {
      return res.status(403).json({
        message: "Please verify your email before logging in.",
        needsVerification: true,
        email,
      });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Incorrect password." });

    const token = generateToken(user);
    const userResponse = user.toJSON();
    delete userResponse.password;
    delete userResponse.otpCode;
    delete userResponse.otpExpiry;

    res.json({ user: userResponse, token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// FORGOT PASSWORD — send OTP
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.scope("withPassword").findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: "No account found with this email." });

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 15 * 60 * 1000);
    await User.update({ otpCode: otp, otpExpiry }, { where: { email } });

    console.log(`\n🔑 Password reset OTP for ${email}: ${otp}\n`);

    try {
      await sendEmail(
        email,
        "Mentor Wave CUET — Password Reset Code",
        `Dear ${user.name.split(" ")[0]},\n\nYour password reset code is:\n\n   ${otp}\n\nThis code expires in 15 minutes. If you did not request a password reset, please ignore this email.\n\nBest regards,\nMentor Wave CUET`
      );
      res.json({ message: "Password reset code sent to your email.", email });
    } catch (emailErr) {
      console.error("Reset email failed:", emailErr.message);
      res.json({ message: "Email could not be sent. Use the demo code.", email, devOtp: otp });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// RESET PASSWORD — verify OTP and set new password
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters." });
    }

    const user = await User.scope("withPassword").findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: "User not found." });

    if (!user.otpCode || user.otpCode !== String(otp).trim()) {
      return res.status(400).json({ message: "Invalid reset code." });
    }
    if (new Date() > new Date(user.otpExpiry)) {
      return res.status(400).json({ message: "Reset code has expired. Please request a new one." });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await User.update({ password: hashed, otpCode: null, otpExpiry: null }, { where: { email } });

    res.json({ message: "Password reset successfully! You can now login." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
