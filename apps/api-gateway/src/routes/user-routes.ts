import {Context, Hono} from "hono";
import {RabbitMQ} from "../config/rabbitmq";
import {queue} from "../config/env";
import {RoutesDeclarator} from "./routes-declarator";
import {createUserBody} from "./validation/user-validation";

export class UsersRoutes implements RoutesDeclarator {

    constructor(private readonly app: Hono, private readonly rabbitMQ: RabbitMQ) {}

    declareRoutes(): void {
        this.app.post('/user', this.createUser)
    }

    private readonly createUser = async (c: Context) => {
        const body = await c.req.json()

        const parseResult = createUserBody.safeParse(body)
        if (!parseResult.success) {
            return c.json({
                message: 'Validation failed',
                issues: parseResult.error.errors
            }, 400)
        }

        console.log(body)
        await this.rabbitMQ.publish(queue, JSON.stringify(body))
        return c.json({
            message: 'Hello Hono !',
        })
    }
}