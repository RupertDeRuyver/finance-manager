import dotenv from "dotenv";
dotenv.config();

import {updateAllTokens, getAvailableBanks} from "./bankAPI";
import {db} from "./db";
import {log} from "./logging";

async function main() {
    await updateAllTokens();
    console.log(await db.selectFrom("transactions").selectAll().execute());
}

main();