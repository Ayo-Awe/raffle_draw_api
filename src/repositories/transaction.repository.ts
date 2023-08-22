import { InferModel, eq, sql } from "drizzle-orm";
import { contestants, tickets, transactions } from "../db/schema";
import { BaseRespository } from "./base.repository";

type NewTransaction = InferModel<typeof transactions, "insert">;

class TransactionRepository extends BaseRespository {
  async create(data: NewTransaction) {
    const [result] = await this.db
      .insert(transactions)
      .values(data)
      .returning();

    return result;
  }

  async getByReference(reference: string) {
    return this.db.query.transactions.findFirst({
      where: eq(transactions.reference, reference),
    });
  }

  async getByRaffleDraw(raffleDrawId: number, offset?: number, limit?: number) {
    const query = this.db
      .select({
        id: transactions.id,
        reference: transactions.reference,
        amountPaid: transactions.amountPaid,
        contestantId: transactions.contestantId,
        quantity: sql<number>`count(${tickets.id})`.mapWith(Number),
        purchasedAt: transactions.purchasedAt,
      })
      .from(transactions)
      .leftJoin(tickets, eq(transactions.id, tickets.transactionId))
      .leftJoin(contestants, eq(transactions.contestantId, contestants.id))
      .where(eq(contestants.raffleDrawId, raffleDrawId))
      .groupBy(transactions.id);

    if (limit) {
      query.limit(limit);
    }

    if (offset) {
      query.offset(offset);
    }

    return await query;
  }
}

export default new TransactionRepository();
