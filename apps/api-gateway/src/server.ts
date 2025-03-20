import {Hono} from "hono";
import {RabbitMQ} from "./config/rabbitmq";
import {serve} from "@hono/node-server";
import {UsersRoutes} from "./routes/user-routes";

export class Gateway {
    private readonly port: number
    private readonly app: Hono
    private readonly rabbitMQ: RabbitMQ

    constructor(port: number, brokerUrl: string) {
        this.port = port
        this.app = new Hono()
        this.rabbitMQ = new RabbitMQ(brokerUrl)
    }

    async start() {
        await this.rabbitMQ.connect()
        console.log("Successfully connected to RabbitMQ !")

        const userRoutes = new UsersRoutes(this.app, this.rabbitMQ)
        userRoutes.declareRoutes()

        serve({
            fetch: this.app.fetch,
            port: this.port
        }, info => console.log(`Listening on http://localhost:${info.port}`))
    }
}