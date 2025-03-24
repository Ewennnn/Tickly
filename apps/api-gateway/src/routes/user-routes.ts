import {Context, Hono} from "hono";
import {RabbitMQ} from "../config/rabbitmq";
import {QUEUES} from "../config/env";
import {RoutesDeclarator} from "./routes-declarator";
import {createUserBody, patchUserBody} from "./validation/user-validation";
import {ContentfulStatusCode} from "hono/dist/types/utils/http-status";

type User = {
    id: number,
    name: string,
    age: number,
    email: string,
    role: 'ROLE_ADMIN' | 'ROLE_USER',
}

type ServiceError = {
    error: string,
    code: ContentfulStatusCode,
}

type ServiceResponse = User | ServiceError

export class UsersRoutes implements RoutesDeclarator {

    constructor(private readonly app: Hono, private readonly rabbitMQ: RabbitMQ) {}

    declareRoutes(): void {
        this.app.post('/user', this.createUser)
        this.app.get('/users', this.getUsers)
        this.app.get("/user/:id", this.getUser)
        this.app.patch('/user', this.patchUser)
        this.app.delete('/user/:id', this.deleteUser)
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

        try {
            const user = await this.rabbitMQ.publishRCP<ServiceResponse>(QUEUES.USERS.create, body)
            return this.doResponse(c, user)
        } catch (err) {
            return c.json({ error: 'No response received from service'}, 500)
        }
    }

    private readonly getUsers = async (c: Context) => {
        try {
            const users = await this.rabbitMQ.publishRCP<User[]>(QUEUES.USERS.getAll, {})
            return c.json(users)
        } catch (err) {
            return c.json({ error: 'No response received from service'}, 500)
        }
    }

    private readonly getUser = async (c: Context) => {
        const id = c.req.param('id')

        try {
            const user = await this.rabbitMQ.publishRCP<ServiceResponse>(QUEUES.USERS.get, { id })
            return this.doResponse(c, user)
        } catch (err) {
            return c.json({ error: 'No response received from service'}, 500)
        }
    }

    private readonly patchUser = async (c: Context) => {
        const body = await c.req.json<User>()

        const parseResult = patchUserBody.safeParse(body)
        if (!parseResult.success) {
            return c.json({
                message: 'Validation failed',
                issues: parseResult.error.errors
            }, 400)
        }

        try {
            const updatedUser = await this.rabbitMQ.publishRCP<ServiceResponse>(QUEUES.USERS.patch, parseResult.data)

            return this.doResponse(c, updatedUser)
        } catch (err) {
            return c.json({ error: 'No response received from service'}, 500)
        }
    }

    private readonly deleteUser = async (c: Context) => {
        const id = c.req.param('id')

        try {
            const deletedUser = await this.rabbitMQ.publishRCP<ServiceResponse>(QUEUES.USERS.delete, { id })
            return this.doResponse(c, deletedUser)
        } catch (err) {
            return c.json({ error: 'No response received from service'}, 500)
        }
    }

    private doResponse(c: Context, response: ServiceResponse) {
        if (this.isError(response)) {
            return c.json({ error: response.error }, response.code)
        }
        return c.json(response)
    }

    private isError(response: ServiceResponse): response is ServiceError {
        return (response as ServiceError).error !== undefined
            && (response as ServiceError).code !== undefined
    }
}