ALTER TABLE "raffle_draws" ALTER COLUMN "ticket_stock" SET DEFAULT 0;
ALTER TABLE "raffle_draws" ALTER COLUMN "ticket_stock" SET NOT NULL;
ALTER TABLE "raffle_draws" ALTER COLUMN "has_infinite_stock" SET NOT NULL;
ALTER TABLE "raffle_draws" DROP COLUMN IF EXISTS "role";
ALTER TABLE "contestants" ADD CONSTRAINT "contestants_email_raffle_draw_id_unique" UNIQUE("email","raffle_draw_id");
ALTER TABLE "raffle_draws" ADD CONSTRAINT "raffle_draws_slug_unique" UNIQUE("slug");
ALTER TABLE "ticket_purchases" ADD CONSTRAINT "ticket_purchases_transaction_reference_unique" UNIQUE("transaction_reference");
ALTER TABLE "users" ADD CONSTRAINT "users_email_unique" UNIQUE("email");
ALTER TABLE "users" ADD CONSTRAINT "users_clerk_id_unique" UNIQUE("clerk_id");