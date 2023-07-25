import { InferModel } from "drizzle-orm";
import { contestants } from "../db/schema";
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
}

export default new ContestantRepository();
