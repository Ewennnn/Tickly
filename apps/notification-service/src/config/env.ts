import dotenv from "dotenv";

dotenv.config()

export const RABBITMQ_URL = requiredEnvVar("RABBITMQ_URL")
export const EMAIL_PASSWORD = requiredEnvVar("EMAIL_PASSWORD")
export const EMAIL_SENDER = requiredEnvVar("EMAIL_SENDER")
export const EMAIL_SENDER_NAME = requiredEnvVar("EMAIL_SENDER_NAME")

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
        getUserFromRefreshToken: "get_user_from_refresh_token_queue",
        logout: "logout_queue",
    },
    NOTIFICATION: {
        sendEmail: "send_email_queue"
    },
    EVENTS: {
        get: "get_events_queue",
        create: "create_event_queue",
        update: "update_event_queue",
        delete: "delete_event_queue",
    },
    TICKETS: {
        create: "create_ticket_queue",
        get: "get_all_tickets_queue",
        delete: "delete_ticket_queue",
        deleteRelatedToEvent: "delete_tickets_related_to_event",
    },
}