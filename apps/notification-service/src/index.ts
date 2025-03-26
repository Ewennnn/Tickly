import {RabbitMQ} from "./config/rabbitmq";
import {EMAIL_PASSWORD, EMAIL_SENDER, QUEUES, RABBITMQ_URL} from "./config/env";
import {SendEmailListener} from "./listeners/send-email-listener";
import nodemailer from 'nodemailer'

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

    // const mailClient = new MailtrapClient({ token: MAILTRAP_TOKEN })
    const transporter: nodemailer.Transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: EMAIL_SENDER,
            pass: EMAIL_PASSWORD
        }
    })

    await rabbitMQ.consume(QUEUES.NOTIFICATION.sendEmail, msg => new SendEmailListener(rabbitMQ, transporter).onMessage(msg))
}