import { Amount } from "./amount"
import { Category } from "./category"

export class Transaction {
    private id: string
    private name: string
    private amount: Amount
    private category: Category;
    private date: Date
    private description: string | undefined

    constructor(id: string, name: string, amount: Amount, category: Category, date: Date, description: string | undefined) {
        this.id = id;
        this.name = name;
        this.amount = amount;
        this.category = category;
        this.date = date;
        this.description = description;
    }
}