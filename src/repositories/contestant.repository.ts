import { InferModel, eq, sql } from "drizzle-orm";
import { contestants, tickets, transactions } from "../db/schema";
import { BaseRespository } from "./base.repository";

type NewContestant = InferModel<typeof contestants, "insert">;

class ContestantRepository extends BaseRespository {
  async create(data: NewContestant) {
    const [result] = await this.db
      .insert(contestants)
      .values(data)
      .onConflictDoNothing()
      .returning();

    return result;
  }

  async getByRaffleDraw(raffleDrawId: number, offset?: number, limit?: number) {
    const query = this.db
      .select({
        id: contestants.id,
        email: contestants.email,
        firstName: contestants.firstName,
        lastName: contestants.lastName,
        ticketCount: sql<number>`count(${tickets.id})`.mapWith(Number),
        createdAt: contestants.createdAt,
        lastPurchaseAt: sql<Date>`max(${tickets.createdAt})`,
      })
      .from(contestants)
      .where(eq(contestants.raffleDrawId, raffleDrawId))
      .leftJoin(transactions, eq(transactions.contestantId, contestants.id))
      .leftJoin(tickets, eq(tickets.transactionId, transactions.id))
      .groupBy(contestants.id);

    if (limit) {
      query.limit(limit);
    }

    if (offset) {
      query.offset(offset);
    }

    return await query;
  }

  async count() {
    const [result] = await this.db
      .select({
        count: sql<number>`count(id)`.mapWith(Number),
      })
      .from(contestants);

    return result.count;
  }
}

export default new ContestantRepository();
