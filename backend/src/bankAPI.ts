import {log} from "./logging";

let access, refresh;

export async function fetchGocardless(url: string, method: "GET"|"POST"|"DELETE"|"PUT", body?: string) {
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
            "Authorization": `Bearer ACCESS`
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
        log(`Error while fetching from Gocardless API: ${response.status} ${response.statusText} ${response.text}`, 2);
        log(await response.json(),5);
    }
}

async function updateAccessToken() {
    log("Updating access token", 5);
}

async function updateAllTokens() {
    log("Updating access and refresh token token", 5);
    const response = await fetch("https://bankaccountdata.gocardless.com/api/v2/token/new/", {
        method: "POST", headers: {
            "Content-Type": "application/json", "accept": "application/json"
        }, body: JSON.stringify({
            "secret_id": process.env.SECRET_ID, "secret_key": process.env.SECRET_KEY
        })
    });
}

//// Pre init checks
// Checking secrets
const SECRET_ID = process.env.SECRET_ID;
const SECRET_KEY = process.env.SECRET_KEY;
if (!SECRET_ID && !SECRET_KEY) {
    log("No SECRET_ID and SECRET_KEY defined",1)
    process.exit(1);
} else if (!SECRET_ID) {
    log("No SECRET_ID defined",1)
    process.exit(1);
} else if (!SECRET_KEY) {
    log("No SECRET_KEY defined",1)
    process.exit(1);
}

//// Init
updateAllTokens();