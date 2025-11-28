export class Amount {
    private value: number

    private static activeCurrency = process.env.ACTIVE_CURRENCY || "EUR";
    private static exchangeRates = new Map([ // Mock exchange rates in relation to EUR (base currency)
        ["EUR", 1],
        ["USD", 1.1],
        ["GBP", 0.9],
        ["JPY", 130],
    ]);

    constructor(value: number, currency: string) {
        this.value = Amount.convertToBaseCurrency(value, currency);
    }

    private static convertToBaseCurrency(value: number, currency: string): number {
        const rate = this.exchangeRates.get(currency)!;
        return value * rate;
    }

    private convertToActiveCurrency(): number {
        return this.value / Amount.exchangeRates.get(Amount.activeCurrency)!;
    }

    public getValue(): number {
        return this.convertToActiveCurrency();
    }
}