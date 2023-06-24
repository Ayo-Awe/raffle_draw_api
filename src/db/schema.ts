import {
  boolean,
  pgTable,
  timestamp,
  varchar,
  serial,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey().notNull(),
  firstName: varchar("first_name", { length: 255 }),
  lastName: varchar("last_name", { length: 255 }),
  email: varchar("email", { length: 255 }).notNull(),
  password: varchar("password", { length: 100 }),
  verificationToken: varchar("verification_token", { length: 255 }),
  verificationTokenExpiresAt: timestamp("verification_token_expires_at"),
  verified: boolean("verified").default(false).notNull(),
  passwordToken: varchar("password_token", { length: 100 }),
  passwordTokenExpiresAt: timestamp("password_token_expires_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
