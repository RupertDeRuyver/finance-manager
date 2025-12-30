export class Location {
    private id: string
    private place: string
    private postalCode: string | undefined
    private countryCode: string

    constructor(id: string, place: string, countryCode: string, postalCode?: string) {
        this.id = id;
        this.place = place;
        this.countryCode = countryCode;
        this.postalCode = postalCode;
    }
}