import dotenv from "dotenv";
dotenv.config();
import express, { Request, Response } from "express";
const app = express()
import cors from "cors";

import {updateAllTokens, getAvailableBanks, createRequisition, getRequisition, requisition_statuses, getAccountDetails} from "./bankAPI";
import {db, prepareDB, updateTransactions} from "./db";
import {endWithMessage, log} from "./logging";
import { GocardlessTransaction } from "./types";

app.use(cors({
  origin: process.env.FRONTEND_URL
}));

app.get('/available-banks', async (req: Request, res: Response) => {
    log(`Received available banks request from ${req.ip}`, 5);
    let country: string | undefined;
    if (typeof req.query.country === "string") {
        country = req.query.country;
    }
    const json = await getAvailableBanks(country);
    if (!json) {
        endWithMessage("Failed to get available banks", res, 500);
        return
    }
    res.json(json)
    log(`Succesfully returned available banks to ${req.ip}`, 5);
})

app.get("/create-requisition", async (req, res) => {
    log(`Received create requisition request from ${req.ip}`, 5);
    if (typeof req.query.institution_id !== "string") {
        endWithMessage(`Didn't receive a valid instituation id`, res, 400);
        return
    }
    createRequisition(req.query.institution_id).then((json) => {
        if (!json) {
            endWithMessage(`Failed to create a requisition with institution id ${req.query.institution_id}`, res, 500);
            return
        }
        res.json(json);
        log(`Succesfully created a requisition for ${req.ip} with institution id ${req.query.institution_id}`, 5);
    })
});

app.get("/confirm-requisition", async (req, res) => {
    log(`Received confirm requisition request from ${req.ip}`, 5);
    if (typeof req.query.requisition_id !== "string") {
        endWithMessage(`Didn't receive a valid requisition id`, res, 400);
        return
    }
    getRequisition(req.query.requisition_id).then((json) => {
        if (!json) {
            endWithMessage(`Failed to get requisition with id ${req.query.requisition_id}`, res, 500);
            return
        }
        if (json.status !== "LN") {
            if (json.status in requisition_statuses) {
                endWithMessage(`Requisition not valid, status: ${requisition_statuses[json.status as keyof typeof requisition_statuses]}`, res, 400);
                return
            } else {
                endWithMessage(`Unknown requisition status: ${json.status}`, res, 500);
                return
            }
        }
        db.insertInto("users").values({
            "name": "test",
            "requisition_id": req.query.requisition_id as string,
            "account_id": json.accounts[0]
        }).execute().then(()  => {
            endWithMessage("Succesfully confirmed requisition and linked account to user", res, 200, 4);
        })
    });
})

app.get("/update-transactions", async (req, res) => {
    log(`Received update transactions request from ${req.ip}`, 5);

    const userId = Number(req.query.user_id)

    // check if userId is a valid number
    if (Number.isNaN(userId)) {
        endWithMessage("Didn't receive a valid user id", res, 400);
        return
    }

    // check if userId exists in db
    const result = await db.selectFrom("users").where("userId","=",userId).select("account_id").executeTakeFirst();
    if (!result) {
        endWithMessage(`Error updating transactions for user ${userId}: Couldn't find account id`, res, 400);
        return
    }

    // get transaction for this user
    const json: {
        transactions: {
            booked: GocardlessTransaction[]
        }
    } = await getAccountDetails(result.account_id, "transactions");

    // check if received transaction successfully
    if (!json) {
        endWithMessage(`Error updating transactions for user ${userId}: Didn't receive transactions`, res, 500)
        return
    }
    log(`Succesfully received transactions for user ${userId}`, 5);

    // update transaction in db
    updateTransactions(json.transactions.booked, userId).then((success) => {
        if (success) {
            endWithMessage(`Succesfully updated all transactions for user with id ${userId}`, res, 200, 4);
            return
        } else {
            endWithMessage(`Failed to update transactions for user with id ${userId}`, res, 500);
            return
        }
    });
})

// DEBUG FUNCTION, REMOVE IN PRODUCTION
app.use(express.json());
app.post("/insert-transactions", (req, res) => {
    log(`Received insert transactions request from ${req.ip}`, 4);
    const userId = Number(req.query.user_id);
    updateTransactions(req.body, userId).then((success) => {
        if (success) {
            endWithMessage(`Succesfully updated all transactions for user with id ${userId}`, res, 200, 5);
            return
        } else {
            endWithMessage(`Failed to update transactions for user with id ${userId}`, res, 500);
            return
        }
    });
})

app.get("/get-transactions", async (req, res) => {
    log(`Received get transactions request from ${req.ip}`, 5);
    const user_id = Number(req.query.user_id)
    if (Number.isNaN(user_id)) {
        endWithMessage("Didn't receive a valid user id", res, 400);
        return
    }
    db.selectFrom("transactions").where("userId","=",user_id).where("deleted","=",false).selectAll().orderBy("date", "desc").execute().then((json) => {
        res.json(json);
        log(`Succesfully returned transactions for user with id ${user_id} to ${req.ip}`,5);
    });
})

Promise.all([updateAllTokens(), prepareDB()]).then(([tokenUpdateSucces, prepareDbSuccess]) => {
    if (!tokenUpdateSucces) {
        log("Failed to update access and refresh token", 2);
    }
    if (!prepareDbSuccess) {
        log("Failed to prepare database", 1);
        process.exit(1);
    }
    app.listen(3000, () => {
        log("Succesfully started backend!", 4);
    })
})
