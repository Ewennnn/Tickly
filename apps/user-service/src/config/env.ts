import dotenv from "dotenv";

dotenv.config()

export const RABBITMQ_URL = requiredEnvVar("RABBITMQ_URL")
export const DATABASE_URL = requiredEnvVar("DATABASE_URL")

function requiredEnvVar(key: string) {
    const value = process.env[key];
    if (value == null) {
        throw new Error(`Environment variable ${key} is required but not set.`);
    }
    return value;
}

export const QUEUES = {
    USERS: {
        create: "create_user_queue",
        getAll: "get_all_users_queue",
        get: "get_user_queue",
        validateCredentials: "validate_credentials_queue",
        patch: "patch_user_queue",
        delete: "delete_user_queue"
    },
    AUTH: {
        login: "login_queue",
        refreshToken: "refresh_token_queue",
        logout: "logout_queue",
    },
}