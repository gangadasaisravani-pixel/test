import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { query, initializeDatabase } from "./db";

dotenv.config();

async function runMigration() {
  console.log("🚀 Starting ClaimProof AI Database Migration Runner...");
  const migrationFile = path.resolve(process.cwd(), "supabase", "migrations", "001_initial_schema.sql");

  if (!fs.existsSync(migrationFile)) {
    console.error("❌ Migration file not found at:", migrationFile);
    process.exit(1);
  }

  const sql = fs.readFileSync(migrationFile, "utf-8");
  console.log(`📄 Applying schema from: ${migrationFile}`);

  try {
    await initializeDatabase();
    console.log("✅ Migration completed successfully!");
    process.exit(0);
  } catch (err: any) {
    console.error("❌ Migration failed:", err.message);
    process.exit(1);
  }
}

runMigration();
