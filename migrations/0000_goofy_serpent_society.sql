DO $$ BEGIN
 CREATE TYPE "invitation_status_enum" AS ENUM('pending', 'accepted', 'rejected', 'expired');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "team_role_enum" AS ENUM('admin', 'member');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "contestants" (
	"id" serial PRIMARY KEY NOT NULL,
	"first_name" varchar(50) NOT NULL,
	"last_name" varchar(50) NOT NULL,
	"email" varchar(100) NOT NULL,
	"metadata" json,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"raffle_draw_id" integer NOT NULL
);

CREATE TABLE IF NOT EXISTS "invitations" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"team_id" integer NOT NULL,
	"role" team_role_enum NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"status" invitation_status_enum DEFAULT 'pending' NOT NULL,
	"invite_token" varchar(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS "raffle_draw_custom_fields" (
	"id" serial PRIMARY KEY NOT NULL,
	"display_name" varchar(50) NOT NULL,
	"variable_name" varchar(50) NOT NULL,
	"required" boolean DEFAULT true NOT NULL,
	"raffle_draw_id" integer NOT NULL
);

CREATE TABLE IF NOT EXISTS "raffle_draws" (
	"id" serial PRIMARY KEY NOT NULL,
	"ticket_unit_price" real NOT NULL,
	"logo" varchar(500),
	"ticket_stock" integer,
	"has_infinite_stock" boolean DEFAULT false,
	"slug" varchar(50) NOT NULL,
	"creator_id" integer NOT NULL,
	"team_id" integer NOT NULL,
	"role" team_role_enum NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"closed_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "team_members" (
	"user_id" integer,
	"team_id" integer,
	"role" team_role_enum NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_user_id_team_id" PRIMARY KEY("user_id","team_id");

CREATE TABLE IF NOT EXISTS "teams" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(50) NOT NULL,
	"bank_account_number" integer,
	"bank_code" varchar(10),
	"email" varchar(100) NOT NULL,
	"is_verified" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"creator_id" integer NOT NULL
);

CREATE TABLE IF NOT EXISTS "ticket_purchases" (
	"id" serial PRIMARY KEY NOT NULL,
	"amount_paid" real NOT NULL,
	"transaction_reference" varchar(255) NOT NULL,
	"purchased_at" timestamp with time zone DEFAULT now() NOT NULL,
	"contestant_id" integer NOT NULL
);

CREATE TABLE IF NOT EXISTS "tickets" (
	"id" serial PRIMARY KEY NOT NULL,
	"is_winning_ticket" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ticket_purchased_id" integer NOT NULL
);

CREATE TABLE IF NOT EXISTS "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"first_name" varchar(50),
	"last_name" varchar(50),
	"email" varchar(100) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);

DO $$ BEGIN
 ALTER TABLE "contestants" ADD CONSTRAINT "contestants_raffle_draw_id_raffle_draws_id_fk" FOREIGN KEY ("raffle_draw_id") REFERENCES "raffle_draws"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "invitations" ADD CONSTRAINT "invitations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "invitations" ADD CONSTRAINT "invitations_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "raffle_draw_custom_fields" ADD CONSTRAINT "raffle_draw_custom_fields_raffle_draw_id_raffle_draws_id_fk" FOREIGN KEY ("raffle_draw_id") REFERENCES "raffle_draws"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "raffle_draws" ADD CONSTRAINT "raffle_draws_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "raffle_draws" ADD CONSTRAINT "raffle_draws_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "team_members" ADD CONSTRAINT "team_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "team_members" ADD CONSTRAINT "team_members_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "teams" ADD CONSTRAINT "teams_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "ticket_purchases" ADD CONSTRAINT "ticket_purchases_contestant_id_contestants_id_fk" FOREIGN KEY ("contestant_id") REFERENCES "contestants"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "tickets" ADD CONSTRAINT "tickets_ticket_purchased_id_ticket_purchases_id_fk" FOREIGN KEY ("ticket_purchased_id") REFERENCES "ticket_purchases"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
