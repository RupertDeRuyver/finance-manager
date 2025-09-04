import { Generated } from "kysely"

export interface Transaction {
  transactionId: string
  userId: number
  name: string
  date: Date
  bookingDate?: Date
  valueDate?: Date
  amount: number
  currency: string
  creditorName?: string | undefined
  creditorAccount?: string
  debtorName?: string | undefined
  debtorAccount?: string
  remittanceInformationUnstructured?: string | undefined
  manual: boolean
  deleted?: boolean
  description?: string
  location?: string | undefined
  postal_code?: string | undefined
  country?: string | undefined
  payment_method?: string | undefined
}

export interface Database {
    transactions: Transaction,
    users: {
      userId: Generated<Number>
      name: string
      account_id: string
      requisition_id: string
    }
}

export interface GocardlessTransaction {
    transactionId: string
    debtorName?: string
    debtorAccount?: {
        iban: string
    }
    creditorName?: string
    creditorAccount?: {
        iban: string
    }
    transactionAmount: {
        currency: string
        amount: number
    }
    bankTransactionCode: string
    bookingDate: Date
    valueDate: Date
    remittanceInformationUnstructured?: string
}

export interface TransactionMetadata {
    name: string
    date: Date
    payment_method?: string | undefined
    country?: string | undefined
    location?: string | undefined
    postal_code?: string | undefined

}