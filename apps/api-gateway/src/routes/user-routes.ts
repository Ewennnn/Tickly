import {Context, Hono} from "hono";
import {RabbitMQ} from "../config/rabbitmq";
import {queue, queue_rcp} from "../config/env";
import {RoutesDeclarator} from "./routes-declarator";
import {createUserBody} from "./validation/user-validation";

type User = {
    id: number,
    name: string,
    age: number,
    email: string,
    role: 'ROLE_ADMIN' | 'ROLE_USER',
}

type ServiceError = {
    error: string,
}

export class UsersRoutes implements RoutesDeclarator {

    constructor(private readonly app: Hono, private readonly rabbitMQ: RabbitMQ) {}

    declareRoutes(): void {
        this.app.post('/user', this.createUser)
        this.app.get('/users', this.getUsers)
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
        const user = await this.rabbitMQ.publishRCP<User | ServiceError>(queue, body)
        return c.json(user)
    }

    private readonly getUsers = async (c: Context) => {
        try {
            const users = await this.rabbitMQ.publishRCP<User[]>(queue_rcp, { users: 'all' })
            return c.json(users)
        } catch (err) {
            return c.json({ error: 'No response received from service'}, 500)
        }
    }
}