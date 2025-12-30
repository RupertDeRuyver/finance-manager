import { Account } from "./account";
import { Amount } from "./amount";
import { Category } from "./category";
import { Location } from "./location";
import { Transaction } from "./transaction";

export class GocardlessTransaction extends Transaction {
    private gocardlessTransactionId: string
    private bookingDate: Date
    private valueDate: Date
    private location: Location | undefined
    private creditor: Account | undefined;
    private debtor: Account | undefined;
    private comment: string | undefined
    private paymentMethod: string | undefined
    private bic: string | undefined
    private remittanceInformationUnstructured: string | undefined

    constructor(id: string, name: string, amount: Amount, category: Category, date: Date, description: string | undefined, gocardlessTransactionId: string, bookingDate: Date, valueDate: Date, location: Location | undefined, creditor: Account | undefined, debtor: Account | undefined, comment: string | undefined, paymentMethod: string | undefined, bic: string | undefined, remittanceInformationUnstructured: string | undefined) {
        super(id, name, amount, category, date, description);
        this.gocardlessTransactionId = gocardlessTransactionId;
        this.bookingDate = bookingDate;
        this.valueDate = valueDate;
        this.location = location;
        this.creditor = creditor;
        this.debtor = debtor;
        this.comment = comment;
        this.paymentMethod = paymentMethod;
        this.bic = bic;
        this.remittanceInformationUnstructured = remittanceInformationUnstructured;
    }

}