const bcrypt = require("bcryptjs");
require("dotenv").config();
const { connectDB } = require("./config/db");
const { syncDB, User } = require("./models");

const seedData = async () => {
  try {
    await connectDB();
    await syncDB();
    const password = await bcrypt.hash("12345678", 10);
    const accounts = [
      { name: "Laiba Tabassum", email: "u2204077@student.cuet.ac.bd", password, role: "admin", isVerified: true },
      { name: "Tahrima Jahan",  email: "u2204078@student.cuet.ac.bd", password, role: "admin", isVerified: true },
      { name: "Srabon Das",     email: "u2204096@student.cuet.ac.bd", password, role: "admin", isVerified: true },
    ];
    console.log("🌱 Seeding admin accounts...");
    for (const account of accounts) {
      const [user, created] = await User.scope("withPassword").findOrCreate({
        where: { email: account.email },
        defaults: account,
      });
      if (!created) {
        await User.update(
          { role: "admin", isVerified: true, password: account.password },
          { where: { email: account.email } }
        );
        console.log(`  ↺ Updated: ${account.name} → admin`);
      } else {
        console.log(`  ✓ Created: ${account.name} (admin)`);
      }
    }
    console.log("\n✅ Seeding complete!");
    console.log("\nAdmin credentials:");
    accounts.forEach(a => console.log(`  ${a.email}  |  12345678`));
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed error:", err.message);
    process.exit(1);
  }
};
seedData();
