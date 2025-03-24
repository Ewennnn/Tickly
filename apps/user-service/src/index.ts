import {CreateUserListener} from "./listeners/create-user-listener";
import {RabbitMQ} from "./config/rabbitmq";
import {DATABASE_URL, QUEUES, RABBITMQ_URL} from "./config/env";
import {Users} from "./db/users";
import {GetUsersListener} from "./listeners/get-users-listener";
import {UpdateUserListener} from "./listeners/update-user-listener";
import {GetUserListener} from "./listeners/get-user-listener";
import {DeleteUserListener} from "./listeners/delete-user-listener";

(async () => {
    try {
        await main()
    } catch (err) {
        console.error("Error starting the service:", err);
    }
})()

async function main() {
    console.log("Starting User Service...");

    const rabbitMQ = new RabbitMQ(RABBITMQ_URL)
    await rabbitMQ.connect()

    const users = new Users(DATABASE_URL)

    await rabbitMQ.consumeRCP(QUEUES.USERS.create, (msg, reply) => new CreateUserListener(users).onMessage(msg, reply))
    await rabbitMQ.consumeRCP(QUEUES.USERS.getAll, (msg, reply) => new GetUsersListener(users).onMessage(msg, reply))
    await rabbitMQ.consumeRCP(QUEUES.USERS.get, (msg, reply) => new GetUserListener(users).onMessage(msg, reply))
    await rabbitMQ.consumeRCP(QUEUES.USERS.patch, (msg, reply) => new UpdateUserListener(users).onMessage(msg, reply))
    await rabbitMQ.consumeRCP(QUEUES.USERS.delete, (msg, reply) => new DeleteUserListener(users).onMessage(msg, reply))
}