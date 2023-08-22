import { InferModel, eq, or, sql } from "drizzle-orm";
import { BaseRespository } from "./base.repository";
import { contestants, raffleDraws, transactions, tickets } from "../db/schema";

type NewRaffleDraw = InferModel<typeof raffleDraws, "insert">;
const selectedRaffleDrawColumns = {
  id: raffleDraws.id,
  name: raffleDraws.name,
  ticketUnitPrice: raffleDraws.ticketUnitPrice,
  logo: raffleDraws.logo,
  ticketStock: raffleDraws.ticketStock,
  hasInfiniteStock: raffleDraws.hasInfiniteStock,
  slug: raffleDraws.ticketStock,
  ticketsSold: sql<number>`count(${tickets.id})`.mapWith(Number),
  creatorId: raffleDraws.creatorId,
  teamId: raffleDraws.teamId,
  createdAt: raffleDraws.createdAt,
  closedAt: raffleDraws.closedAt,
  updatedAt: raffleDraws.updatedAt,
};

class RaffleDrawRepository extends BaseRespository {
  async getById(raffleDrawId: number) {
    const [result] = await this.db
      .select(selectedRaffleDrawColumns)
      .from(raffleDraws)
      .leftJoin(contestants, eq(contestants.raffleDrawId, raffleDraws.id))
      .leftJoin(transactions, eq(transactions.contestantId, contestants.id))
      .leftJoin(tickets, eq(tickets.transactionId, transactions.id))
      .where(eq(raffleDraws.id, raffleDrawId))
      .groupBy(raffleDraws.id);

    return result;
  }
  async getBySlug(slug: string) {
    const [result] = await this.db
      .select(selectedRaffleDrawColumns)
      .from(raffleDraws)
      .leftJoin(contestants, eq(contestants.raffleDrawId, raffleDraws.id))
      .leftJoin(transactions, eq(transactions.contestantId, contestants.id))
      .leftJoin(tickets, eq(tickets.transactionId, transactions.id))
      .where(eq(raffleDraws.slug, slug))
      .groupBy(raffleDraws.id);

    return result;
  }

  async getByIdOrSlug(idOrSlug: number | string) {
    const [result] = await this.db
      .select(selectedRaffleDrawColumns)
      .from(raffleDraws)
      .leftJoin(contestants, eq(contestants.raffleDrawId, raffleDraws.id))
      .leftJoin(transactions, eq(transactions.contestantId, contestants.id))
      .leftJoin(tickets, eq(tickets.transactionId, transactions.id))
      .where(
        typeof idOrSlug === "number"
          ? eq(raffleDraws.id, idOrSlug)
          : eq(raffleDraws.slug, idOrSlug)
      )
      .groupBy(raffleDraws.id);

    return result;
  }

  async getByTeamId(teamId: number) {
    return this.db.query.raffleDraws.findMany({
      where: eq(raffleDraws.teamId, teamId),
    });
  }

  async create(data: NewRaffleDraw) {
    const [result] = await this.db.insert(raffleDraws).values(data).returning();
    return result;
  }

  async update() {}
}

export default new RaffleDrawRepository();
