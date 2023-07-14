ALTER TABLE "team_members" ALTER COLUMN "user_id" SET NOT NULL;
ALTER TABLE "team_members" ALTER COLUMN "team_id" SET NOT NULL;
ALTER TABLE "teams" ALTER COLUMN "bank_account_number" SET DATA TYPE varchar(20);
ALTER TABLE "teams" ADD COLUMN "subaccount_code" varchar(50);