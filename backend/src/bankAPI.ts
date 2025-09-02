import {httpError, log} from "./logging";

let access: string, refresh: string;

export const requisition_statuses = {
    "CR": "CREATED",
    "GC": "GIVING_CONSENT",
    "UA": "UNDERGOING_AUTHENTICATION",
    "RJ": "REJECTED",
    "SA": "SELECTING_ACCOUNTS",
    "GA": "GRANTING_ACCESS",
    "EX": "EXPIRED"
}

async function fetchGocardless(url: string, method: "GET"|"POST"|"DELETE"|"PUT", body?: any) {
    log("Fetching data from Gocardless API", 5);
    let init: {
        method: "GET"|"POST"|"DELETE"|"PUT",
        headers: {
            "accept": string,
            "Content-Type": string,
            "Authorization": string
        },
        body?: string
    } = {
        method: method,
        headers: {
            "accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": `Bearer ${access}`
        }
    }
    if (body) {
        init.body = JSON.stringify(body);
    }
    let response: Response
    try {
        response = await fetch(url, init);
    } catch {
        log("Fetch error",2);
        return
    }
    if (response.ok) {
        log("Succesfully fetched data from Gocardless API", 5)
        return await response.json();
    } else if (response.status === 401) {
        log("Access token expired, refreshing...", 3)
        await updateAccessToken();
        return await fetchGocardless(url, method, body);
    } else {
        await httpError("Error while fetching from Gocardless API", response);
        return;
    }
}

async function updateAccessToken() {
    // TODO
    log("Updating access token, but I'm not implemented yet", 5);
    return updateAllTokens();
}

export async function updateAllTokens(): Promise<boolean> {
    log("Updating access and refresh token token", 5);
    let response: Response;
    try {
        response = await fetch("https://bankaccountdata.gocardless.com/api/v2/token/new/", {
            method: "POST", headers: {
                "Content-Type": "application/json", "accept": "application/json"
            }, body: JSON.stringify({
                "secret_id": process.env.SECRET_ID, "secret_key": process.env.SECRET_KEY
            })
        });
    } catch {
        log("Fetch error", 2);
        return false
    }
    if (response.ok) {
        const json = await response.json();
        access = json.access;
        refresh = json.refresh;
        log("Updated access and refresh token", 4);
        return true
    } else {
        await httpError("Failed to update access and refresh token", response);
        return false
    }
}

export async function getAvailableBanks(country: string = "be") {
    log("Fetching available banks for " + country, 5);
    return (await fetchGocardless(`https://bankaccountdata.gocardless.com/api/v2/institutions/?country=${country}`, "GET"));
}

export async function createRequisition(institution_id: string) {
    log("Creating requisition for " + institution_id, 5);
    return (await fetchGocardless("https://bankaccountdata.gocardless.com/api/v2/requisitions/", "POST", {
        "institution_id": institution_id, "redirect": `${FRONTEND_URL}/confirm`
    }))
}

export async function getRequisition(requisition_id: string) {
    log("Fetching requisition for " + requisition_id, 5);
    return (await fetchGocardless(`https://bankaccountdata.gocardless.com/api/v2/requisitions/${requisition_id}/`, "GET"));
}

export async function getAccountDetails(account_id: string, type: "balances" | "details" | "transactions") {
    log("Fetching account details for " + account_id + " of type " + type, 5);
    return (await fetchGocardless(`https://bankaccountdata.gocardless.com/api/v2/accounts/${account_id}/${type}/`, "GET"));
}

//// Pre init checks
// Checking env variables
const SECRET_ID = process.env.SECRET_ID;
const SECRET_KEY = process.env.SECRET_KEY;
if (!SECRET_ID && !SECRET_KEY) {
    log("No SECRET_ID and SECRET_KEY defined", 1)
    process.exit(1);
} else if (!SECRET_ID) {
    log("No SECRET_ID defined", 1)
    process.exit(1);
} else if (!SECRET_KEY) {
    log("No SECRET_KEY defined", 1)
    process.exit(1);
}
const FRONTEND_URL = process.env.FRONTEND_URL;
if (!FRONTEND_URL) {
    log("No FRONTEND_URL defined", 1)
    process.exit(1);
}