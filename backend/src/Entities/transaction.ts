import { generateMetadata } from "../metadata"
import { GocardlessTransaction } from "../types"
import { Amount } from "./amount"
import { Category } from "./category"
import { Counterparty } from "./counterparty"
import { Place } from "./place"

export class Transaction {
    private id: string
    private name: string
    private amount: Amount
    private category: Category;

    private date: Date
    private bookingDate: Date
    private valueDate: Date

    private location: Place | undefined

    private creditor: Counterparty | undefined;
    private debtor: Counterparty | undefined;
    private comment: string | undefined
    private paymentMethod: string | undefined
    private bic: string | undefined
    private remittanceInformationUnstructured: string | undefined

    private manual: boolean
    private deleted: boolean
    private description: string | undefined

    constructor(transaction: GocardlessTransaction) {
        const metadata = generateMetadata(transaction);

        this.id = transaction.transactionId
        this.name = metadata.name
        this.amount = new Amount(transaction.transactionAmount.amount, transaction.transactionAmount.currency)
        this.category = metadata.category;
        this.date = metadata.date
        this.bookingDate = new Date(transaction.bookingDate)
        this.valueDate = new Date(transaction.valueDate)
        this.location = metadata.location
        this.creditor = transaction.creditorName ? new Counterparty(transaction.creditorName) : undefined
        this.debtor = transaction.debtorName ? new Counterparty(transaction.debtorName) : undefined
        this.comment = metadata.comment
        this.paymentMethod = metadata.payment_method
        this.bic = metadata.bic
        this.remittanceInformationUnstructured = transaction.remittanceInformationUnstructured
        this.manual = false
        this.deleted = false
        this.description = undefined

    }
}