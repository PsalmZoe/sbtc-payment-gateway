require("dotenv").config();
const { neon } = require("@neondatabase/serverless");
const fs = require("fs");
const path = require("path");

async function runMigrations() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error("❌ DATABASE_URL environment variable is required");
    process.exit(1);
  }

  console.log("🔗 Connecting to database...");
  const sql = neon(databaseUrl);

  try {
    // Run initial schema
    console.log("📋 Running initial schema migration...");
    const initialSchema = fs.readFileSync(
      path.join(__dirname, "001-initial-schema.sql"),
      "utf8"
    );
    await sql.unsafe(initialSchema);
    console.log("✅ Initial schema migration completed");

    // Run subscription schema
    console.log("📋 Running subscription schema migration...");
    const subscriptionSchema = fs.readFileSync(
      path.join(__dirname, "002-subscription-schema.sql"),
      "utf8"
    );
    await sql.unsafe(subscriptionSchema);
    console.log("✅ Subscription schema migration completed");

    console.log("🎉 All migrations completed successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  runMigrations();
}

module.exports = { runMigrations };
