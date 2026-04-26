const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, text) => {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    throw new Error("EMAIL_USER or EMAIL_PASS not set in .env");
  }

  // Nodemailer 8.x uses createTransport differently — use explicit SMTP config
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // TLS
    auth: { user, pass },
    tls: { rejectUnauthorized: false },
  });

  await transporter.sendMail({
    from: `"Mentor Wave CUET" <${user}>`,
    to,
    subject,
    text,
  });
};

module.exports = sendEmail;
