import { PgTransaction } from "drizzle-orm/pg-core";
import { ExtractTablesWithRelations } from "drizzle-orm";
import { PostgresJsQueryResultHKT } from "drizzle-orm/postgres-js";
import database from "../db";
import * as schema from "../db/schema";

export type Transaction = PgTransaction<
  PostgresJsQueryResultHKT,
  typeof schema,
  ExtractTablesWithRelations<typeof schema>
>;

export type DB = typeof database | Transaction;

export class BaseRespository {
  protected db: DB;

  constructor(tx?: Transaction) {
    if (tx) {
      this.db = tx;
    } else {
      this.db = database;
    }
  }

  static get [Symbol.species]() {
    return this;
  }

  withTransaction(tx: Transaction): typeof this {
    // @ts-ignore
    const Constructor = this.constructor[Symbol.species];
    return new Constructor(tx);
  }
}
