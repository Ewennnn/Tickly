import {Hono} from "hono";
import {cors} from "hono/cors"
import {RabbitMQ} from "./config/rabbitmq";
import {serve} from "@hono/node-server";
import {UsersRoutes} from "./routes/user-routes";
import {AuthRoutes} from "./routes/auth-routes";
import {EventsRoutes} from "./routes/events-routes";
import {TicketsRoutes} from "./routes/tickets-routes";

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
        try {
            await this.rabbitMQ.connect()
            console.log("Successfully connected to RabbitMQ !")
        } catch (err) {
            console.warn(`Failed to connect to RabbitMQ with url ${this.rabbitMQ.url}`)
        }

        this.app.use('*', cors({
            origin: '*',
            allowHeaders: ['Content-Type', 'Authorization'],
            allowMethods: ['GET', 'POST', 'PATCH', 'DELETE'],
        }))

        this.app.onError((err, c) => {
            return c.json({
                error: 'Unexpected error',
                verbose: err.message,
            }, 500)
        })

        const userRoutes = new UsersRoutes(this.app, this.rabbitMQ)
        userRoutes.declareRoutes()

        const authRoutes = new AuthRoutes(this.app, this.rabbitMQ)
        authRoutes.declareRoutes()

        const eventRoutes = new EventsRoutes(this.app, this.rabbitMQ)
        eventRoutes.declareRoutes()

        const ticketRoutes = new TicketsRoutes(this.app, this.rabbitMQ)
        ticketRoutes.declareRoutes()

        serve({
            fetch: this.app.fetch,
            port: this.port
        }, info => console.log(`Listening on http://localhost:${info.port}`))
    }
}