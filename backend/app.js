const express = require("express");
const cors = require("cors");

const app = express();

// CORS — allow the frontend to call the API from any origin
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.json({ message: "Mentor Wave API Running ✅" });
});

// Routes
app.use("/api/auth",         require("./routes/authRoutes"));
app.use("/api/users",        require("./routes/userRoutes"));
app.use("/api/tuition",      require("./routes/tuitionRoutes"));
app.use("/api/applications", require("./routes/applicationRoutes"));
app.use("/api/messages",     require("./routes/messageRoutes"));
app.use("/api/admin",        require("./routes/adminRoutes"));

// 404 fallback
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

module.exports = app;
