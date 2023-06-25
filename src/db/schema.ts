import {
  boolean,
  pgTable,
  timestamp,
  varchar,
  serial,
  integer,
  pgEnum,
  real,
  json,
  primaryKey,
} from "drizzle-orm/pg-core";

export const teamRoleEnum = pgEnum("team_role_enum", ["admin", "member"]);
export const invitationStatus = pgEnum("invitation_status_enum", [
  "pending",
  "accepted",
  "rejected",
  "expired",
]);

export const users = pgTable("users", {
  id: serial("id").primaryKey().notNull(),
  firstName: varchar("first_name", { length: 50 }),
  lastName: varchar("last_name", { length: 50 }),
  email: varchar("email", { length: 100 }).notNull(),
  clerkId: varchar("clerk_id", { length: 50 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updatedAt", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const teams = pgTable("teams", {
  id: serial("id").primaryKey().notNull(),
  name: varchar("name", { length: 50 }).notNull(),
  bankAccountNumber: integer("bank_account_number"),
  bankCode: varchar("bank_code", { length: 10 }),
  teamEmail: varchar("email", { length: 100 }).notNull(),
  isVerified: boolean("is_verified").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  creatorId: integer("creator_id")
    .references(() => users.id)
    .notNull(),
});

export const teamMembers = pgTable(
  "team_members",
  {
    userId: integer("user_id").references(() => users.id),
    teamId: integer("team_id").references(() => teams.id),
    role: teamRoleEnum("role").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({ pk: primaryKey(table.userId, table.teamId) })
);

export const invitations = pgTable("invitations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  teamId: integer("team_id")
    .references(() => teams.id)
    .notNull(),
  role: teamRoleEnum("role").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  status: invitationStatus("status").notNull().default("pending"),
  invite_token: varchar("invite_token", { length: 100 }).notNull(),
});

export const raffleDraws = pgTable("raffle_draws", {
  id: serial("id").primaryKey(),
  ticketUnitPrice: real("ticket_unit_price").notNull(),
  logo: varchar("logo", { length: 500 }),
  ticketStock: integer("ticket_stock"),
  hasInfiniteStock: boolean("has_infinite_stock").default(false),
  slug: varchar("slug", { length: 50 }).notNull(),
  creatorId: integer("creator_id")
    .references(() => users.id)
    .notNull(),
  teamId: integer("team_id")
    .references(() => teams.id)
    .notNull(),
  role: teamRoleEnum("role").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  closedAt: timestamp("closed_at", { withTimezone: true }),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const contestants = pgTable("contestants", {
  id: serial("id").primaryKey(),
  firstName: varchar("first_name", { length: 50 }).notNull(),
  lastName: varchar("last_name", { length: 50 }).notNull(),
  email: varchar("email", { length: 100 }).notNull(),
  metadata: json("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  raffleDrawId: integer("raffle_draw_id")
    .references(() => raffleDraws.id)
    .notNull(),
});

export const ticketPurchases = pgTable("ticket_purchases", {
  id: serial("id").primaryKey(),
  amountPaid: real("amount_paid").notNull(),
  transactionReference: varchar("transaction_reference", {
    length: 255,
  }).notNull(),
  purchasedAt: timestamp("purchased_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  contestantId: integer("contestant_id")
    .references(() => contestants.id)
    .notNull(),
});

export const tickets = pgTable("tickets", {
  id: serial("id").primaryKey(),
  isWinningTicket: boolean("is_winning_ticket").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  ticketPurchaseId: integer("ticket_purchased_id")
    .references(() => ticketPurchases.id)
    .notNull(),
});

export const raffleDrawCustomFields = pgTable("raffle_draw_custom_fields", {
  id: serial("id").primaryKey(),
  displayName: varchar("display_name", { length: 50 }).notNull(),
  variableName: varchar("variable_name", { length: 50 }).notNull(),
  required: boolean("required").notNull().default(true),
  raffleDrawId: integer("raffle_draw_id")
    .references(() => raffleDraws.id)
    .notNull(),
});
