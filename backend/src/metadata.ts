import { log } from "./logging";
import { Category, GocardlessTransaction, Subcategory, Transaction, TransactionMetadata } from "./types";
import rawCategories from '../json/categories.json';
const categories: Record<string, Category> = rawCategories;

const NAME_PATTERNS = [
    /(.*) ([A-Z]{2})([0-9]{0,4}) ([A-Za-z -]+) Betaling met (.*) via (.*) ([0-9]{2}-[0-9]{2}-[0-9]{4}) om ([0-9]{2}.[0-9]{2}) uur (.*)/,
    /(.*) ([A-Z]{2})([0-9]{0,4}[A-Z]{0,2}) ([A-Za-z -]+) Betaling met (.*) via (.*) ([0-9]{2}-[0-9]{2}-[0-9]{4}) om ([0-9]{2}.[0-9]{2}) uur (.*)/,
    /(.*) Betaling met (.*) via (.*) ([0-9]{2}-[0-9]{2}-[0-9]{4}) om ([0-9]{2}.[0-9]{2}) uur (.*)/,
    /(.*) Betaling met (.*) via (.*) ([0-9]{2}-[0-9]{2}-[0-9]{4}) (.*)/,
    /(.*) Domiciliëring (.*)/,
    /(.*) (Instantoverschrijving|Overschrijving) ([A-Z]{2}[0-9]{2} [0-9]{4} [0-9]{4} [0-9]{4}) BIC: ([A-Z]{6}[A-Z0-9]{2}(?:[A-Z0-9]{3})?) (.*) ([0-9]{2}\.[0-9]{2}) uur (.*)/, // [naam, (instant)overschrijving, IBAN, BIC, opmerking, tijdstip, extra text]
    /(.*) (Instantoverschrijving|Overschrijving) ([A-Z]{2}[0-9]{2} [0-9]{4} [0-9]{4} [0-9]{4}) BIC: ([A-Z]{6}[A-Z0-9]{2}(?:[A-Z0-9]{3})?) (.*) ([0-9]{2}\.[0-9]{2}) uur$/, // [naam, (instant)overschrijving, IBAN, BIC, opmerking, tijdstip]
    /(.*) (Instantoverschrijving|Overschrijving) ([A-Z]{2}[0-9]{2} [0-9]{4} [0-9]{4} [0-9]{4}) BIC: ([A-Z]{6}[A-Z0-9]{2}(?:[A-Z0-9]{3})?) ([0-9]{2}\.[0-9]{2}) uur (.*)/, // [naam, (instant)overschrijving, IBAN, BIC, tijdstip, extra text]
    /(.*) (Instantoverschrijving|Overschrijving) ([A-Z]{2}[0-9]{2} [0-9]{4} [0-9]{4} [0-9]{4}) BIC: ([A-Z]{6}[A-Z0-9]{2}(?:[A-Z0-9]{3})?) ([0-9]{2}\.[0-9]{2}) uur$/, // [naam, (instant)overschrijving, IBAN, BIC, tijdstip]
    /(.*) (Instantoverschrijving|Overschrijving) ([A-Z]{2}[0-9]{2} [0-9]{4} [0-9]{4} [0-9]{4}) BIC: ([A-Z]{6}[A-Z0-9]{2}(?:[A-Z0-9]{3})?) (.*)/, // [naam, (instant)overschrijving, IBAN, BIC, opmerking]
    /(.*) (Instantoverschrijving|Overschrijving) ([A-Z]{2}[0-9]{2} [0-9]{4} [0-9]{4} [0-9]{4}) BIC: ([A-Z]{6}[A-Z0-9]{2}(?:[A-Z0-9]{3})?)$/, // [naam, (instant)overschrijving, IBAN, BIC]
]

export function generateMetadata(transaction: GocardlessTransaction): TransactionMetadata {
    log(`Generating metadata for transaction with id ${transaction.transactionId}`,5)

    let name: string = "Unknown Transaction";
    let country: string | undefined = undefined;
    let postal_code: string | undefined = undefined;
    let location: string | undefined = undefined;
    let payment_method: string | undefined = undefined;
    let date: Date = generateDateTimeId(transaction.transactionId) ?? generateDate(transaction.bookingDate) ?? generateDate(transaction.valueDate) ?? new Date(); // Default value in case a more useful value can't be extracted
    let bic: string | undefined;
    let comment: string | undefined;

    if (transaction.remittanceInformationUnstructured) {

        name = transaction.remittanceInformationUnstructured // Default value in case a more useful value can't be extracted

        for (let [index, pattern] of NAME_PATTERNS.entries()) {

            const match = transaction.remittanceInformationUnstructured.match(pattern);
            if (!match) {continue}
            log(`Matched regex pattern number ${index+1}`, 5);

            name = match[1] as string; // Name is always at the same place, regardless of which pattern

            if (index == 0 || index == 1) { // Matches pattern 1 or 2
                country = match[2];
                postal_code = match[3];
                location = match[4];
                payment_method = match[5] + " " + match[6];
                date = generateDateTime(match[7], match[8]) ?? date;

            } else if (index == 2) { // Matches pattern 3
                payment_method = match[2] + " " + match[3];
                date = generateDateTime(match[4], match[5]) ?? date;

            } else if (index == 3) { // Matches pattern 4
                payment_method = match[2] + " " + match[3];
                date = generateDate(match[4]) ?? date;

            } else if (index == 5 || index == 6) { // Matches pattern 6 or 7
                // [naam, (instant)overschrijving, IBAN, BIC, opmerking, tijdstip, (extra text)]
                if (match[7]) {
                    payment_method = match[2] + " " + match[7];
                } else {
                    payment_method = match[2];
                }
                bic = match[4];
                comment = match[5];
                date = generateDateTime(transaction.bookingDate, match[6], true) ?? date;

            } else if (index == 7 || index == 8) { // Matches pattern 8 or 9
                // [naam, (instant)overschrijving, IBAN, BIC, tijdstip, (extra text)]
                if (match[6]) {
                    payment_method = match[2] + " " + match[6];
                } else {
                    payment_method = match[2];
                }
                bic = match[4];
                date = generateDateTime(transaction.bookingDate, match[5], true) ?? date;

            } else if (index == 9 || index == 10) { // Matches pattern 10 or 11
                // [naam, (instant)overschrijving, IBAN, BIC, (opmerking)]
                payment_method = match[2]
                bic = match[4]
                if (match[5]) {
                    comment = match[5]
                }
            }

            break // Don't loop over the other possible patterns
        }
    }

    if (transaction.transactionAmount.amount < 0 && transaction.creditorName) { // If amount is negative and transaction contains creditorName, take that as name
        name = transaction.creditorName;
    } else if (transaction.transactionAmount.amount > 0 && transaction.debtorName) { // If amount is positive and transaction contains debtorName, take that as name
        name = transaction.debtorName;
    }

    const [category, subcategory] = predictCategory([name, comment]);

    return {
        name: name,
        date: date,
        payment_method: payment_method,
        country: country,
        location: location,
        postal_code: postal_code,
        category: category,
        subcategory: subcategory,
        bic: bic,
        comment: comment
    }
}

function generateDateTime(date: string | undefined, time: string | undefined, reverseDate: boolean = false): Date | undefined { // generate date and time from format DD-MM-YYYY and HH:MM
    console.log(date)
    console.log(time)
    if (!date || !time) {
        return
    }

    const split_date = date.split("-"); // [day, month, year]
    const split_time = time.split("."); // [hour, minutes]

    if (split_date.length !== 3 || split_time.length !== 2) {
        log("Error in time format for transaction", 2);
        return;
    } // check if split was successful and if lenghts are correct

    let yearStr: string | undefined;
    let monthStr: string | undefined;
    let dayStr: string | undefined;

    if (reverseDate) {
        [yearStr, monthStr, dayStr] = split_date;
    } else {
        [dayStr, monthStr, yearStr] = split_date;
    }

    const [hourStr, minuteStr] = split_time;

    const day = parseInt(dayStr!, 10);
    const month = parseInt(monthStr!, 10) - 1; // januari is 0
    const year = parseInt(yearStr!, 10);
    const hour = parseInt(hourStr!, 10);
    const minute = parseInt(minuteStr!, 10);
    
    if ([day, month, year, hour, minute].some(isNaN)) {
        log("Error while converting time parts to numbers for transaction", 2);
        return;
    } // check if converting to number failed somewhere
    console.log( new Date(year, month, day, hour, minute));
    return new Date(year, month, day, hour, minute);
}

function generateDate(date: string | undefined): Date | undefined { // generate date and time from format DD-MM-YYYY
    if (!date) {
        return
    }

    const split_date = date.split("-"); // [day, month, year]

    if (split_date.length !== 3) {
        log("Error in date format for transaction", 2);
        return;
    } // check if split was successful and if lenghts are correct

    const [dayStr, monthStr, yearStr] = split_date;

    const day = parseInt(dayStr!, 10);
    const month = parseInt(monthStr!, 10) - 1; // januari is 0
    const year = parseInt(yearStr!, 10);

    if ([day, month, year].some(isNaN)) {
        log("Error while converting date parts to numbers for transaction", 2);
        return;
    } // check if converting to number failed somewhere

    return new Date(year, month, day);
}

function generateDateTimeId(transactionId: string): Date | undefined { // generate date and time from info in transactionId
    // Example: 2025-09-10-13.02.59.335432

    const split_date = transactionId.split("-");

    if (split_date.length !== 4) {
        log("Error in date format for transaction", 2);
        return;
    } // check if split was successful and if lenghts are correct

    const [yearStr, monthStr, dayStr] = split_date;

    const split_time = split_date[3]!.split(".");

    if (split_date.length !== 4) {
        log("Error in time format for transaction", 2);
        return;
    } // check if split was successful and if lenghts are correct

    const [hourStr, minuteStr, secondStr, _ID] = split_time;

    const day = parseInt(dayStr!, 10);
    const month = parseInt(monthStr!, 10) - 1; // januari is 0
    const year = parseInt(yearStr!, 10);
    const hour = parseInt(hourStr!, 10);
    const minute = parseInt(minuteStr!, 10);
    const second = parseInt(secondStr!, 10);

    if ([day, month, year, hour, minute, second].some(isNaN)) {
        log("Error while converting time parts to numbers for transaction", 2);
        return;
    } // check if converting to number failed somewhere

    return new Date(year, month, day, hour, minute, second);
}

export function predictCategory(strings: (string | undefined)[]): [string, string] {
    for (const [category_id, category] of Object.entries(categories)) {
        for (const [subcategory_id, subcategory] of Object.entries(category.subcategories)) {
            if (!("keywords" in subcategory)) {continue} // Skip if subcategory has no keywords
            for (const rawKeyword of subcategory.keywords) {
                const keyword = rawKeyword.toLowerCase();
                if (strings.some((string) => string?.toLowerCase().includes(keyword))) {
                    return [category_id, subcategory_id]
                }
            }
        }
    }
    return ["unknown", "unknown"]
}