import { Pool } from 'pg'
import { Kysely, PostgresDialect, Generated, sql } from 'kysely'

import {getAccountDetails} from "./bankAPI";
import {log} from "./logging";

interface Transaction {
  transactionId: string
  userId: Number
  name: string
  date: Date
  bookingDate?: Date
  valueDate?: Date
  amount: Number
  currency: string
  creditorName?: string
  creditorAccount?: string
  debtorName?: string
  debtorAccount?: string
  remittanceInformationUnstructured?: string
  manual: boolean
  deleted?: boolean
  description?: string
  location?: string
  postal_code?: string
  country?: string
  payment_method?: string
}
interface Database {
    transactions: Transaction,
    users: {
      userId: Generated<Number>
      name: string
      account_id: string
      requisition_id: string
    }
}

export const db = new Kysely<Database>({
  dialect: 
    new PostgresDialect({
      pool: 
        new Pool({
          connectionString: process.env.DATABASE_URL
        })
    })
})

export async function prepareDB(): Promise<boolean> {
  log("Preparing database", 5);
  try {
    await db.schema
      .createTable("transactions")
      .ifNotExists()
      .addColumn("transactionId", "text", (col) =>
        col.notNull().defaultTo(sql`gen_random_uuid()`)
      )
      .addColumn("name", "text", (col) => col.notNull())
      .addColumn("userId", "serial", (col) => col.notNull())
      .addColumn("date", "timestamp", (col) => col.notNull())
      .addColumn("bookingDate", "date")
      .addColumn("valueDate", "date")
      .addColumn("amount", sql`numeric(12,2)`, (col) => col.notNull())
      .addColumn("currency", "text", (col) => col.notNull())
      .addColumn("creditorName", "text")
      .addColumn("creditorAccount", "text")
      .addColumn("debtorName", "text")
      .addColumn("debtorAccount", "text")
      .addColumn("remittanceInformationUnstructured", "text")
      .addColumn("manual", "boolean", (col) => col.notNull())
      .addColumn("deleted", "boolean", (col) => col.notNull().defaultTo(false))
      .addColumn("description", "text")
      .addColumn("location", "text")
      .addColumn("postal_code", "text")
      .addColumn("country", "text")
      .addColumn("payment_method", "text")
      .addPrimaryKeyConstraint("transactions_pkey", ["transactionId"])
      .execute();

    await db.schema
      .createTable("users")
      .ifNotExists()
      .addColumn("userId", "serial", (col) => col.primaryKey())
      .addColumn("name", "text", (col) => col.notNull())
      .addColumn("account_id", "text", (col) => col.notNull())
      .addColumn("requisition_id", "text", (col) => col.notNull())
      .execute();
    log("Succesfully prepared database", 5);
    return true
  } catch {
    log("Failed to prepare database", 2);
    return false
  }
}

export async function updateTransactions(userId: number): Promise<boolean> {
  log("Updating transactions for user " + userId, 5);
  const result = await db.selectFrom("users").where("userId","=",userId).select("account_id").executeTakeFirst();
  if (!result) {
    log(`Error updating transactions for user ${userId}: Couldn't find account id`, 2)
    return false
  }
  const json = await getAccountDetails(result.account_id, "transactions");
  if (!json) {
    log(`Error updating transactions for user ${userId}: Didn't receive transactions`, 2)
    return false
  }
  log(`Succesfully received transactions for user ${userId}`, 5);
  let transactions: Transaction[] = [];
  for (const transaction of json.transactions.booked) {
    transactions.push({
      transactionId: transaction.transactionId,
      userId: userId,
      name: transaction.remittanceInformationUnstructured,
      date: transaction.bookingDate,
      bookingDate: transaction.bookingDate,
      valueDate: transaction.valueDate,
      amount: transaction.amount,
      currency: transaction.currency,
      creditorName: transaction.creditorName,
      creditorAccount: transaction.creditorAccount,
      debtorName: transaction.debtorName,
      debtorAccount: transaction.debtorAccount,
      remittanceInformationUnstructured: transaction.remittanceInformationUnstructured,
      manual: false
    });
  }
  await db.insertInto("transactions").values(transactions).onConflict((oc) => oc.column("transactionId").doNothing()).execute()
  return true
}