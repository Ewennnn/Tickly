import amqp from "amqplib";

export class RabbitMQ {
    private connection!: amqp.ChannelModel
    private channel!: amqp.Channel

    constructor(private readonly url: string) {}

    async connect() {
        this.connection = await amqp.connect(this.url)
        this.channel = await this.connection.createChannel()
    }

    async consume(queue: string, onMessage: (msg: string) => void) {
        await this.channel.assertQueue(queue, { durable: true })

        await this.channel.consume(queue, message => {
            if (!message) return

            try {
                onMessage(message.content.toString())
            } catch (err) {
                console.error(`Error occurred: ${err}`)
            }
            this.channel.ack(message)
        })
    }

    async publish(queue: string, message: string) {
        await this.channel.assertQueue(queue, { durable: true })

        this.channel.sendToQueue(queue, Buffer.from(message))
    }

    async close() {
        await this.channel.close()
        await this.connection.close()
    }
}