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
        if (level == 1 || level == 2) {
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
    log(`${message}: ${response.status} ${response.statusText} ${await response.text}`, errorLevel);
    console.log(await response.json());
}

export function endWithMessage(message: string, res: ExpressResponse, status: number, level: LogLevel = 2) {
    res.status(status).end(message);
    log(message, level);
}

// Setting log level
const ENV_LEVEL = process.env.LOG_LEVEL;
const LOG_LEVEL = Number(ENV_LEVEL) || 5;
if (!ENV_LEVEL) {
  log("No log level set, defaulting to INFO", 3);
}