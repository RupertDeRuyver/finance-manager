import { log } from "./logging";
import { GocardlessTransaction, TransactionMetadata } from "./types";

const NAME_PATTERNS = [
    /(.*) ([A-Z]{2})([0-9]{0,4}) ([A-Za-z -]+) Betaling met (.*) via (.*) ([0-9]{2}-[0-9]{2}-[0-9]{4}) om ([0-9]{2}.[0-9]{2}) uur (.*)/,
    /(.*) ([A-Z]{2})([0-9]{0,4}[A-Z]{0,2}) ([A-Za-z -]+) Betaling met (.*) via (.*) ([0-9]{2}-[0-9]{2}-[0-9]{4}) om ([0-9]{2}.[0-9]{2}) uur (.*)/,
    /(.*) Betaling met (.*) via (.*) ([0-9]{2}-[0-9]{2}-[0-9]{4}) om ([0-9]{2}.[0-9]{2}) uur (.*)/,
    /(.*) Betaling met (.*) via (.*) ([0-9]{2}-[0-9]{2}-[0-9]{4}) (.*)/,
    /(.*) Domiciliëring (.*)/,
]

export function generateMetadata(transaction: GocardlessTransaction): TransactionMetadata {
    log(`Generating metadata for transaction with id ${transaction.transactionId}`,5)
    let name: string = "ERROR";
    let country: string | undefined = undefined;
    let postal_code: string | undefined = undefined;
    let location: string | undefined = undefined;
    let payment_method: string | undefined = undefined;
    let date: Date = transaction.bookingDate; // Default value in case a more useful value can't be extracted
    if (transaction.remittanceInformationUnstructured) {
        log("Transaction contains additional info", 5);
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
                date = customFormatDate(match[7], match[8]) ?? date;
            } else if (index == 2) { // Matches pattern 3
                payment_method = match[2] + "+" + match[3];
                date = new Date(match[4] + " " + match[5]);
            } else if (index == 3) {
                payment_method = match[2] + "+" + match[3];
                date = new Date(match[4] as string);
            }
            break // Don't loop over the other possible patterns
        }
    }
    if (transaction.transactionAmount.amount < 0 && transaction.creditorName) { // If amount is negative and transaction contains creditorName, take that as name
        log("Transaction negative and has creditorName, taking that as name", 5);
        name = transaction.creditorName;
    } else if (transaction.transactionAmount.amount > 0 && transaction.debtorName) { // If amount is positive and transaction contains debtorName, take that as name
        log("Transaction positive and has debtorName, taking that as name", 5);
        name = transaction.debtorName;
    }
    log(`Succesfully generated metadata for transaction with id ${transaction.transactionId}`,5)
    return {
        name: name,
        date: date,
        payment_method: payment_method,
        country: country,
        location: location,
        postal_code: postal_code
    }
}

function customFormatDate(date: string | undefined, time: string | undefined): Date | undefined {
    if (!date || !time) {
        return
    }

    const split_date = date.split("-"); // [day, month, year]
    const split_time = time.split("."); // [hour, seconds]

    if (!split_date || !split_time || split_date.length !== 3 || split_time.length !== 2) {
        log("Error in time format for transaction", 2);
        return;
    } // check if split was successful and if lenghts are correct

    const [dayStr, monthStr, yearStr] = split_date;
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

    return new Date(year, month, day, hour, minute);
}