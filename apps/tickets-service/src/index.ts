import {RabbitMQ} from "./config/rabbitmq";
import {DATABASE_URL, QUEUES, RABBITMQ_URL} from "./config/env";
import {Tickets} from "./db/tickets";
import {CreateTicketListener} from "./listeners/create-ticket-listener";
import {DeleteTicketListener} from "./listeners/delete-ticket-listener";
import {GetTicketListener} from "./listeners/get-ticket-listener";
import {DeleteFromEventListener} from "./listeners/delete-from-event-listener";

(async () => {
    try {
        await main()
    } catch (err) {
        console.error("Error starting the service:", err);
    }
})()

async function main() {
    console.log("Starting Tickets Service...");

    const rabbitMQ = new RabbitMQ(RABBITMQ_URL)
    await rabbitMQ.connect()

    const tickets = new Tickets(DATABASE_URL)

    await rabbitMQ.consumeRPC(QUEUES.TICKETS.create, (msg, reply) => new CreateTicketListener(rabbitMQ, tickets).onMessage(msg, reply));
    await rabbitMQ.consumeRPC(QUEUES.TICKETS.get, (msg, reply) => new GetTicketListener(tickets).onMessage(msg, reply));
    await rabbitMQ.consumeRPC(QUEUES.TICKETS.delete, (msg, reply) => new DeleteTicketListener(tickets).onMessage(msg, reply));
    await rabbitMQ.consume(QUEUES.TICKETS.deleteRelatedToEvent, msg => new DeleteFromEventListener(tickets).onMessage(msg))
}