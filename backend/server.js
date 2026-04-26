const app = require("./app");
const { connectDB } = require("./config/db");
const { syncDB } = require("./models"); 
require("dotenv").config();

const start = async () => {
  try {
    await connectDB();
    await syncDB(); // This links to point 1's export

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  } catch (error) {
    console.error("❌ Failed to start server:", error);
  }
};

start();