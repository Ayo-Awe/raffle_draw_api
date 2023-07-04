import * as dotenv from "dotenv";
dotenv.config();

export const clerkSecret = process.env.CLERK_SECRET_KEY!;
