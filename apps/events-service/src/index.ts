import {RabbitMQ} from "./config/rabbitmq";
import {DATABASE_URL, QUEUES, RABBITMQ_URL} from "./config/env";
import {Events} from "./db/events";
import {CreateEventListener} from "./listeners/create-event-listener";
import {UpdateEventListener} from "./listeners/update-event-listener";
import {DeleteEventListener} from "./listeners/delete-event-listener";
import {GetEventListener} from "./listeners/get-event-listener";

(async () => {
    try {
        await main()
    } catch (err) {
        console.error("Error starting the service:", err);
    }
})()

async function main() {
    console.log("Starting Events Service...");

    const rabbitMQ = new RabbitMQ(RABBITMQ_URL)
    await rabbitMQ.connect()

    const events = new Events(DATABASE_URL)

    await rabbitMQ.consumeRPC(QUEUES.EVENTS.create, (msg, reply) => new CreateEventListener(events).onMessage(msg, reply));
    await rabbitMQ.consumeRPC(QUEUES.EVENTS.update, (msg, reply) => new UpdateEventListener(events).onMessage(msg, reply));
    await rabbitMQ.consumeRPC(QUEUES.EVENTS.delete, (msg, reply) => new DeleteEventListener(rabbitMQ, events).onMessage(msg, reply));
    await rabbitMQ.consumeRPC(QUEUES.EVENTS.get, (msg, reply) => new GetEventListener(rabbitMQ, events).onMessage(msg, reply));
}