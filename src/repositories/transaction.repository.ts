import { InferModel, eq } from "drizzle-orm";
import { transactions } from "../db/schema";
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
}

export default new TransactionRepository();
