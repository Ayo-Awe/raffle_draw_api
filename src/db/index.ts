import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as dotenv from "dotenv";
import * as schema from "./schema";
dotenv.config();

export const dbURL = process.env.DB_URL!;
export const migrationClient = postgres(dbURL, { max: 1 });

const queryClient = postgres(dbURL);

export default drizzle(queryClient, { schema });
