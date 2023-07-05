import * as dotenv from "dotenv";
dotenv.config();

export default {
  out: "./migrations",
  schema: "./src/db/schema.ts",
  breakpoints: false,
  driver: "pg",
  dbCredentials: {
    connectionString: process.env.DB_URL,
  },
};
