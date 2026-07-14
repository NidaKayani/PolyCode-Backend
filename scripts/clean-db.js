/**
 * Wipe all collections in the PolyCode MongoDB database.
 *
 * Usage:
 *   node scripts/clean-db.js --yes
 *
 * Requires MONGODB_URI (or MONGODB_USER/PASSWORD/CLUSTER) in backend/.env.
 * Refuses to run without --yes.
 */

require("dotenv").config();
const mongoose = require("mongoose");
const { connectToMongoDB, getMongoUri } = require("../src/config/database");

async function main() {
  if (!process.argv.includes("--yes")) {
    console.error(
      "Refusing to wipe the database.\n" +
        "Re-run with --yes to drop every collection:\n" +
        "  npm run clean-db -- --yes",
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
  const collections = await db.listCollections().toArray();

  if (collections.length === 0) {
    console.log(`Database "${dbName}" is already empty.`);
    await mongoose.disconnect();
    return;
  }

  console.log(`Dropping ${collections.length} collection(s) from "${dbName}":`);
  for (const col of collections) {
    await db.dropCollection(col.name);
    console.log(`  - dropped ${col.name}`);
  }

  console.log("Done. App will recreate users + learner_progress on first use.");
  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error("clean-db failed:", error.message);
  try {
    await mongoose.disconnect();
  } catch {
    /* ignore */
  }
  process.exit(1);
});
