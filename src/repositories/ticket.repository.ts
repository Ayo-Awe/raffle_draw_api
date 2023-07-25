import { InferModel } from "drizzle-orm";
import { tickets } from "../db/schema";
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
}

export default new TicketRepository();
