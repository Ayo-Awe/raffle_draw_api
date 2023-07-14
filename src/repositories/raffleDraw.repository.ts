import { InferModel, eq, or } from "drizzle-orm";
import { BaseRespository } from "./base.repository";
import { raffleDraws } from "../db/schema";

type NewRaffleDraw = InferModel<typeof raffleDraws, "insert">;

class RaffleDrawRepository extends BaseRespository {
  async getById(raffleDrawId: number) {
    return this.db.query.raffleDraws.findFirst({
      where: eq(raffleDraws.id, raffleDrawId),
    });
  }

  async getByIdOrSlug(idOrSlug: number | string) {
    if (typeof idOrSlug === "number") {
      return this.db.query.raffleDraws.findFirst({
        where: eq(raffleDraws.id, idOrSlug),
      });
    }

    return this.db.query.raffleDraws.findFirst({
      where: eq(raffleDraws.slug, idOrSlug),
    });
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
