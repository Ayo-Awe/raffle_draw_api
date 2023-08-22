import { InferModel, eq } from "drizzle-orm";
import { contestants, tickets, transactions } from "../db/schema";
import { BaseRespository } from "./base.repository";

export type NewTicket = InferModel<typeof tickets, "insert">;

class TicketRepository extends BaseRespository {
  async create(data: NewTicket) {
    const [result] = await this.db.insert(tickets).values(data).returning();
    return result;
  }

  async createBulk(data: NewTicket[]) {
    const result = await this.db.insert(tickets).values(data).returning();
    return result;
  }

  async getByRaffleDraw(raffleDrawId: number, offset?: number, limit?: number) {
    const query = this.db
      .select({
        id: tickets.id,
        email: contestants.email,
        isWinningTicket: tickets.isWinningTicket,
        transactionReference: transactions.reference,
        contestantId: contestants.id,
        createdAt: tickets.createdAt,
      })
      .from(tickets)
      .leftJoin(transactions, eq(transactions.id, tickets.transactionId))
      .leftJoin(contestants, eq(transactions.contestantId, contestants.id))
      .where(eq(contestants.raffleDrawId, raffleDrawId));

    if (limit) {
      query.limit(limit);
    }

    if (offset) {
      query.offset(offset);
    }

    return await query;
  }
}

export default new TicketRepository();
