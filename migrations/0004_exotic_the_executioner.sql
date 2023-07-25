ALTER TABLE "ticket_purchases" RENAME TO "transactions";
ALTER TABLE "tickets" RENAME COLUMN "ticket_purchased_id" TO "transaction_id";
ALTER TABLE "transactions" RENAME COLUMN "transaction_reference" TO "reference";
ALTER TABLE "transactions" DROP CONSTRAINT "ticket_purchases_transaction_reference_unique";
ALTER TABLE "tickets" DROP CONSTRAINT "tickets_ticket_purchased_id_ticket_purchases_id_fk";

ALTER TABLE "transactions" DROP CONSTRAINT "ticket_purchases_contestant_id_contestants_id_fk";

DO $$ BEGIN
 ALTER TABLE "tickets" ADD CONSTRAINT "tickets_transaction_id_transactions_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "transactions" ADD CONSTRAINT "transactions_contestant_id_contestants_id_fk" FOREIGN KEY ("contestant_id") REFERENCES "contestants"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

ALTER TABLE "transactions" ADD CONSTRAINT "transactions_reference_unique" UNIQUE("reference");