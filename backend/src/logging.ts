import { Response as ExpressResponse } from "express";

const log_levels = {
    1: "FATAL",
    2: "ERROR",
    3: "WARNING",
    4: "INFO",
    5: "DEBUG"
}

type LogLevel = keyof typeof log_levels

export function log(message: string, level: LogLevel) {
    if (LOG_LEVEL >= level) {
        const out = `[${log_levels[level]}] ${message}`;
        if (level == 1) {
            console.error(out);
            process.exit(1);
        } else  if (level == 2) {
            console.error(out);
        } else if (level == 3) {
            console.warn(out);
        } else if (level == 4) {
            console.info(out);
        } else if (level == 5) {
            console.log(out);  
        }
    }
}

export async function httpError(message: string, response: Response, errorLevel: LogLevel = 2, detailLevel: LogLevel = 5) {
    log(`${message}: ${response.status} ${response.statusText} ${response.text}`, errorLevel);
    log(await response.json(), detailLevel);
}

export function endWithMessage(message: string, res: ExpressResponse, status: number, level: LogLevel = 2) {
    res.status(status).end(message);
    log(message, level);
}

// Setting log level
let LOG_LEVEL: LogLevel;
const ENV_LEVEL = process.env.LOG_LEVEL;

if (ENV_LEVEL) { // LOG_LEVEL is set in .env

    LOG_LEVEL = Number(ENV_LEVEL) as LogLevel;

    if (Number.isNaN(LOG_LEVEL)) {
        LOG_LEVEL = 4;
        log(`Invalid LOG_LEVEL in .env: ${ENV_LEVEL}. Must be a number from 1 to 5. Defaulting to ${log_levels[LOG_LEVEL]}`, 2);
    }
    
} else { // LOG_LEVEL is not set in .env
    LOG_LEVEL = 4;
    log(`No log level set, defaulting to ${log_levels[LOG_LEVEL]}`, 3);
}