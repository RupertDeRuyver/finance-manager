import {httpError, log} from "./logging";

let access: string, refresh: string;

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
        init.body = body;
    }
    const response = await fetch(url, init);
    if (response.ok) {
        log("Succesfully fetched data from Gocardless API", 5)
        return await response.json();
    } else if (response.status === 401) {
        log("Access token expired, refreshing...", 3)
        await updateAccessToken();
        return await fetchGocardless(url, method, body);
    } else {
        httpError("Error while fetching from Gocardless API", response);
    }
}

async function updateAccessToken() {
    log("Updating access token, but I'm not implemented yet", 5);
}

export async function updateAllTokens() {
    log("Updating access and refresh token token", 5);
    const response = await fetch("https://bankaccountdata.gocardless.com/api/v2/token/new/", {
        method: "POST", headers: {
            "Content-Type": "application/json", "accept": "application/json"
        }, body: JSON.stringify({
            "secret_id": process.env.SECRET_ID, "secret_key": process.env.SECRET_KEY
        })
    });
    if (response.ok) {
        const json = await response.json();
        access = json.access;
        refresh = json.refresh;
        log("Updated access and refresh token", 4);
    } else {
        httpError("Failed to update access and refresh token", response);
    }
}

export async function getAvailableBanks(country: string = "be") {
    log("Fetching available banks for " + country, 5);
    return (await fetchGocardless(`https://bankaccountdata.gocardless.com/api/v2/institutions/?country=${country}`, "GET"));
}

export async function createRequisition(institution_id: string) {
    log("Creating requisition for " + institution_id, 5);
    return (await fetchGocardless("https://bankaccountdata.gocardless.com/api/v2/requisitions/", "POST", {
        institution_id: institution_id, redirect: `${FRONTEND_URL}/confirm`
    }))
}

export async function getRequisition(requisition_id: string) {
    log("Fetching requisition for " + requisition_id, 5);
    return (await fetchGocardless(`https://bankaccountdata.gocardless.com/api/v2/requisitions/${requisition_id}/`, "GET"));
}

export async function getAccountDetails(account_id: string, type: string) {
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