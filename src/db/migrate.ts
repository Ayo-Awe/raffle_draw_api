import { migrate } from "drizzle-orm/postgres-js/migrator";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrationClient } from ".";
import * as dotenv from "dotenv";
dotenv.config();

// IIFE to run migration asynchronously
(async () => {
  try {
    const db = drizzle(migrationClient);
    await migrate(db, { migrationsFolder: "./migrations" });
    console.log("Migration successful!!!");
    process.exit(0);
  } catch (error: any) {
    console.error(error);
    console.error("Migration failed");
    console.error(error.message);
    process.exit(1);
  }
})();
