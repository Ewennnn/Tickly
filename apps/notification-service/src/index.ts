import {RabbitMQ} from "./config/rabbitmq";
import {MAILTRAP_TOKEN, QUEUES, RABBITMQ_URL} from "./config/env";
import {SendEmailListener} from "./listeners/send-email-listener";
import {MailtrapClient} from "mailtrap";

(async () => {
    try {
        await main()
    } catch (err) {
        console.error("Error starting the service:", err);
    }
})()

async function main() {
    console.log("Starting Notification Service...");

    const rabbitMQ = new RabbitMQ(RABBITMQ_URL)
    await rabbitMQ.connect()

    const mailClient = new MailtrapClient({ token: MAILTRAP_TOKEN })

    await rabbitMQ.consume(QUEUES.NOTIFICATION.sendEmail, msg => new SendEmailListener(rabbitMQ, mailClient).onMessage(msg))
}