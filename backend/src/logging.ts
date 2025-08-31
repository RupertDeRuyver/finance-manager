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

// Setting log level
const ENV_LEVEL = process.env.LOG_LEVEL;
const LOG_LEVEL = Number(ENV_LEVEL) || 5;
if (!ENV_LEVEL) {
  log("No log level set, defaulting to INFO", 3);
}