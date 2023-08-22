import { Transaction } from "../repositories/base.repository";
import db from "../db";
import { number } from "zod";

type TransactionCallback<T> = (tx: Transaction) => Promise<T>;

export async function withTransaction<T>(
  tx: Transaction | null | undefined,
  callback: TransactionCallback<T>
): Promise<T>;

export async function withTransaction<T>(
  callback: TransactionCallback<T>
): Promise<T>;

export async function withTransaction<T>(
  txOrCallback: Transaction | null | undefined | TransactionCallback<T>,
  callback?: TransactionCallback<T>
) {
  let tx: Transaction | null | undefined;

  if (typeof txOrCallback === "function") {
    callback = txOrCallback;
    tx = null;
  } else {
    tx = txOrCallback;
  }

  if (!callback) {
    throw new Error("Transaction callback is required");
  }

  if (tx) {
    return callback(tx);
  }

  return await db.transaction(async (tx) => {
    return callback!(tx);
  });
}
