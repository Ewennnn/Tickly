import dotenv from "dotenv";

dotenv.config()

export const RABBITMQ_URL = requiredEnvVar("RABBITMQ_URL")
export const DATABASE_URL = requiredEnvVar("DATABASE_URL")
export const queue = 'user_queue'
export const queue_rcp = 'users_rcp_queue'

function requiredEnvVar(key: string) {
    const value = process.env[key];
    if (value == null) {
        throw new Error(`Environment variable ${key} is required but not set.`);
    }
    return value;
}