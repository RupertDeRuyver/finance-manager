import dotenv from "dotenv";
dotenv.config();

import {updateAllTokens, getAvailableBanks} from "./bankAPI";
import {log} from "./logging";

async function main() {
    await updateAllTokens();
    console.log(await getAvailableBanks())
}

main();