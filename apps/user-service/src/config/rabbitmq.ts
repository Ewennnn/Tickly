import amqp from "amqplib";

export class RabbitMQ {
    private connection: amqp.ChannelModel
    private channel: amqp.Channel
    private replyQueue: string;
    private readonly responses: Map<string, (response: any) => void> = new Map()

    constructor(private readonly url: string) {}

    /**
     * Initialise la connexion à RabbitMQ et l'écoute des channels de réponse.
     */
    async connect() {
        this.connection = await amqp.connect(this.url)
        this.channel = await this.connection.createChannel()

        //     Queue temporaire pour les réponses
        //     La chaine de caractère vide permet à RabbitMQ de générer un nom aléatoire
        //     La clé 'exclusive' permet de créer une queue privée qui sera supprimée à la fermeture de la connexion
        const q = await this.channel.assertQueue('', { exclusive: true })
        this.replyQueue = q.queue

        //     Écoute les réponses et débloque les promises en attente
        this.channel.consume(this.replyQueue, message => {
            if (!message) return

            // Le correlationId permet de ne pas mélanger les promises
            const correlationId = message.properties.correlationId
            const response = JSON.parse(message.content.toString())

            // Déblocage de la promise en attente d'une réponse
            if (this.responses.has(correlationId)) {
                this.responses.get(correlationId)!(response)
                this.responses.delete(correlationId)
            }
        })
    }

    /**
     * Démarre l'écoute d'une queue.
     * Un callback est appelé à la réception d'un message dans la queue.
     * @param queue Nom de la queue à écouter.
     * @param onMessage Callback exécuté à la réception du message.
     */
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

    /**
     * Consomme le contenu d'une queue et retourne une réponse.
     * @param queue Nom de la queue qui sera consommée.
     * @param onMessage Callback appelée pour envoyer une réponse.
     */
    async consumeRCP(queue: string, onMessage: (msg: string, reply: (response: object) => void) => void) {
        await this.channel.assertQueue(queue, { durable: true })

        await this.channel.consume(queue, message => {
            if (!message) return

            try {
                const correlationId = message.properties.correlationId
                const replyTo = message.properties.replyTo

                if (!correlationId || !replyTo) {
                    console.error(`No correlationId or replyTo provided from request`)
                    return;
                }

                const content = message.content.toString()

                onMessage(content, response => {
                    this.channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(response)), { correlationId })
                })
            } catch (err) {
                console.error(`Error occurred during RCP consumption: ${err}`)
            }
            this.channel.ack(message)
        })
    }

    /**
     * Publie un message dans une queue sans attendre de réponse.
     * @param queue Nom de la queue qui sera alimentée.
     * @param message Message envoyé dans la queue.
     */
    async publish(queue: string, message: string) {
        await this.channel.assertQueue(queue, { durable: true })

        this.channel.sendToQueue(queue, Buffer.from(message))
    }

    /**
     * Envoie un message dans une queue et attend une réponse de la part du service.
     * Le déblocage des promises est gérée dans la méthode {@link connect()}.
     * @param queue Nom de la queue qui sera alimentée.
     * @param message Message envoyé dans la queue.
     * @return Promise contenant la réponse du service
     */
    async publishRCP<R>(queue: string, message: object): Promise<R> {
        return new Promise((resolve, reject) => {
            const correlationId = Math.random().toString(36).substring(7)

            this.responses.set(correlationId, resolve)

            this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), {
                correlationId,
                replyTo: this.replyQueue
            })

            //     Timeout en cas de non réponse
            setTimeout(() => {
                if (this.responses.has(correlationId)) {
                    this.responses.delete(correlationId)
                    reject(new Error(`No response received for ${correlationId}`))
                }
            }, 5000)
        })
    }

    /**
     * Ferme la connexion à RabbitMQ.
     */
    async close() {
        await this.channel.close()
        await this.connection.close()
    }
}