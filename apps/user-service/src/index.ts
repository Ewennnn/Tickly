import {CreateUserListener} from "./listeners/create-user-listener";
import {RabbitMQ} from "./config/rabbitmq";
import {DATABASE_URL, queue, queue_rcp, RABBITMQ_URL} from "./config/env";
import {Users} from "./db/users";
import {GetUsersListener} from "./listeners/get-users-listener";

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

    await rabbitMQ.consumeRCP(queue, (msg, reply) => new CreateUserListener(users).onMessage(msg, reply))
    await rabbitMQ.consumeRCP(queue_rcp, (msg, reply) => new GetUsersListener(users).onMessage(msg, reply))
    console.log(`Ready to receive messages from ${queue}`)
}