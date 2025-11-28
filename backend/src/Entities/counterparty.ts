export class Counterparty {
    private name: string;
    private account: string | undefined;

    constructor(name: string, account?: string) {
        this.name = name;
        this.account = account;
    }
}