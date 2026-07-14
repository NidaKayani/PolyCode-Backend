/**
 * Drop the `users` collection only (keeps learner_progress and the rest).
 *
 * Usage:
 *   node scripts/clean-users.js --yes
 *   npm run clean-users -- --yes
 *
 * Requires MONGODB_URI (or split Mongo vars) in backend/.env.
 * Refuses to run without --yes.
 */

require("dotenv").config();
const mongoose = require("mongoose");
const { connectToMongoDB, getMongoUri } = require("../src/config/database");

async function main() {
  if (!process.argv.includes("--yes")) {
    console.error(
      "Refusing to wipe users.\n" +
        "Re-run with --yes to drop the users collection:\n" +
        "  npm run clean-users -- --yes",
    );
    process.exit(1);
  }

  const uri = getMongoUri();
  if (!uri) {
    console.error(
      "No MongoDB URI configured. Set MONGODB_URI or MONGODB_USER/PASSWORD/CLUSTER in backend/.env",
    );
    process.exit(1);
  }

  const conn = await connectToMongoDB();
  if (!conn) {
    console.error("Could not connect to MongoDB.");
    process.exit(1);
  }

  const db = mongoose.connection.db;
  const dbName = db.databaseName;
  const collections = await db.listCollections({ name: "users" }).toArray();

  if (collections.length === 0) {
    console.log(`No "users" collection in "${dbName}" — nothing to drop.`);
    await mongoose.disconnect();
    return;
  }

  await db.dropCollection("users");
  console.log(`Dropped "users" from "${dbName}".`);
  console.log("Register or Continue with Google to create lean user documents.");
  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error("clean-users failed:", error.message);
  try {
    await mongoose.disconnect();
  } catch {
    /* ignore */
  }
  process.exit(1);
});
