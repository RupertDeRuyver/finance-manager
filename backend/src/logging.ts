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
        console.log(`[${log_levels[level]}] ${message}`);  
    }
}

export async function httpError(message: string, response: Response, errorLevel: LogLevel = 2, detailLevel: LogLevel = 5) {
    log(`${message}: ${response.status} ${response.statusText} ${response.text}`, errorLevel);
    log(await response.json(),detailLevel);
}

// Setting log level
const ENV_LEVEL = process.env.LOG_LEVEL;
const LOG_LEVEL = Number(ENV_LEVEL) || 5;
if (!ENV_LEVEL) {
  log("No log level set, defaulting to INFO", 3);
}