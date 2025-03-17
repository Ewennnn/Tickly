import amqplib from 'amqplib'
import dotenv from "dotenv";

dotenv.config()
const RABBITMQ_URL = process.env.RABBITMQ_URL

if (!RABBITMQ_URL) {
    throw new Error(`No RabbitMQ url provided`)
}

export const sendMessage = async (queue: string, message: string) => {
    try {
        const connection = await amqplib.connect(RABBITMQ_URL)
        const chanel = await connection.createChannel()

        await chanel.assertQueue(queue, { durable: true })
        chanel.sendToQueue(queue, Buffer.from(message))
        console.log(`📤 Message envoyé à ${queue}: ${message}`)

        setTimeout(() => {
            connection.close()
        }, 500)
    } catch (err) {
        console.error("❌ Erreur envoi message RabbitMQ:", err);
    }
}