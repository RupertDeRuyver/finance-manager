import { Pool } from 'pg'
import { Kysely, PostgresDialect } from 'kysely'

import {
  Generated
} from 'kysely'

interface Database {
    transactions: {
        transactionId: Generated<string>
        name: string
        date: Date
        bookingDate: Date | undefined
        valueDate: Date | undefined
        amount: Number
        currency: string
        creditorName: string | undefined
        creditorAccount: string | undefined
        debtorName: string | undefined
        debtorAccount: string | undefined
        remittanceInformationUnstructured: string | undefined
        manual: boolean
        deleted: boolean
        description: string | undefined
        location: string | undefined
        postal_code: string | undefined
        country: string | undefined
        payment_method: string |undefined
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