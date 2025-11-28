export class Place {
    private place: string
    private postalCode: string | undefined
    private country: string

    constructor(place: string, country: string, postalCode?: string) {
        this.place = place
        this.country = country
        this.postalCode = postalCode
    }
}