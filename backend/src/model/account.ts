export class Account {
    private id: string;
    private name: string;
    private account: string | undefined;

    constructor(id: string, name: string, account?: string) {
        this.id = id;
        this.name = name;
        this.account = account;
    }
}