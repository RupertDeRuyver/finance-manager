import { Pool } from 'pg'
import { Kysely, PostgresDialect, sql } from 'kysely'

import {log} from "./logging";
import { generateMetadata } from './metadata';
import type { Transaction, Database, GocardlessTransaction } from './types';

//// Pre init checks
// Checking env variables
const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
    log("No DATABASE_URL defined", 1);
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
      .addColumn("category", "text", (col) => col.notNull())
      .addColumn("subcategory", "text", (col) => col.notNull())
      .addColumn("bic", "text")
      .addColumn("comment", "text")
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
  } catch (error) {
    log("Failed to prepare database: " + (error as Error).message, 1);
    return false
  }
}

export async function updateTransactions(gocardless_transactions: GocardlessTransaction[], userId: number): Promise<number> {
  log("Updating transactions for user " + userId, 5);
  let transactions: Transaction[] = [];
  for (const transaction of gocardless_transactions) {
    const metadata = generateMetadata(transaction);
    let data: Transaction = {
      transactionId: transaction.transactionId,
      userId: userId,
      name: metadata.name,
      date: metadata.date,
      bookingDate: transaction.bookingDate,
      valueDate: transaction.valueDate,
      amount: transaction.transactionAmount.amount,
      currency: transaction.transactionAmount.currency,
      creditorName: transaction.creditorName,
      debtorName: transaction.debtorName,
      remittanceInformationUnstructured: transaction.remittanceInformationUnstructured,
      manual: false,
      payment_method: metadata.payment_method,
      country: metadata.country,
      location: metadata.location,
      postal_code: metadata.postal_code,
      category: metadata.category,
      subcategory: metadata.subcategory,
      bic: metadata.bic,
      comment: metadata.comment
    };
    if (transaction.creditorAccount) {
      data.creditorAccount = transaction.creditorAccount.iban;
    }
    if (transaction.debtorAccount) {
      data.debtorAccount = transaction.debtorAccount.iban;
    }
    
    transactions.push(data);
  }

  await db.insertInto("transactions").values(transactions).onConflict((oc) => oc.column("transactionId").doNothing()).execute()
  return transactions.length;
}