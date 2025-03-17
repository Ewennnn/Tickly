import amqplib from 'amqplib/callback_api'
import dotenv from 'dotenv'

dotenv.config()
const RABBITMQ_URL = process.env.RABBITMQ_URL
const queue = 'user_queue'

if (!RABBITMQ_URL) {
    throw new Error(`No RabbitMQ url provided`)
}

amqplib.connect(RABBITMQ_URL, (err, conn) => {
    if (err) throw err

    conn.createChannel((err1, ch) => {
        if (err1) throw err1

        ch.assertQueue(queue, { durable: true })

        console.log(`👂 User-Service écoute sur ${queue}...`);
        ch.consume(queue, msg => {
            if (msg !== null) {
                console.log(`📩 Message reçu: ${msg.content.toString()}`);
                ch.ack(msg)
            } else {
                console.log("❌ Consumer cancelled by server")
            }
        })
    })
})