import {CreateUserListener} from "./listeners/create-user-listener";
import {RabbitMQ} from "./config/rabbitmq";
import {DATABASE_URL, queue, RABBITMQ_URL} from "./config/env";
import {Users} from "./db/users";

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

    await rabbitMQ.consume(queue, msg => new CreateUserListener(users).onMessage(msg))
    console.log(`Ready to receive messages from ${queue}`)
}