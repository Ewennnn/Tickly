import dotenv from "dotenv";

dotenv.config()

export const RABBITMQ_URL = requiredEnvVar("RABBITMQ_URL")
export const queue = 'user_queue'

function requiredEnvVar(key: string) {
    const value = process.env[key];
    if (value == null) {
        throw new Error(`Environment variable ${key} is required but not set.`);
    }
    return value;
}