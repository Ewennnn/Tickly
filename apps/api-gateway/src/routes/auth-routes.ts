import {RoutesDeclarator} from "./routes-declarator";
import {Context, Hono} from "hono";
import {RabbitMQ} from "../config/rabbitmq";
import {credentialsBody, refreshTokenBody} from "./validation/auth-validation";
import {QUEUES} from "../config/env";
import {ContentfulStatusCode} from "hono/dist/types/utils/http-status";

type Credentials = {
    email: string,
    password: string,
}

type RefreshToken = {
    refreshToken: string,
}

type TokensResponse = {
    accessToken: string,
    refreshToken: string,
}

type ServiceError = {
    error: string,
    code: ContentfulStatusCode,
}

type ServiceResponse = ServiceError | TokensResponse | RefreshToken

export class AuthRoutes implements RoutesDeclarator {

    constructor(private readonly app: Hono, private readonly rabbitMQ: RabbitMQ) {}

    declareRoutes(): void {
        this.app.post('/auth/login', this.login)
        this.app.post('/auth/refresh', this.refresh)
        this.app.post('/auth/logout', this.logout)
    }

    private readonly login = async (c: Context) => {
        const body = await c.req.json<Credentials>()

        const parseResult = credentialsBody.safeParse(body)
        if (!parseResult.success) {
            return c.json({
                error: 'Validation failed',
                issues: parseResult.error.errors,
            }, 400)
        }

        try {
            const response = await this.rabbitMQ.publishRPC<ServiceResponse>(QUEUES.AUTH.login, body)
            return this.doResponse(c, response)
        } catch (err) {
            return c.json({ error: 'No response received from service'}, 500)
        }
    }

    private readonly refresh = async (c: Context) => {
        const body = await c.req.json<RefreshToken>()

        const parseResult = refreshTokenBody.safeParse(body)
        if (!parseResult.success) {
            return c.json({
                error: 'Validation failed',
                issues: parseResult.error.errors,
            }, 400)
        }

        try {
            const response = await this.rabbitMQ.publishRPC<ServiceResponse>(QUEUES.AUTH.refreshToken, body)
            return this.doResponse(c, response)
        } catch (err) {
            return c.json({ error: 'No response received from service'}, 500)
        }

    }

    private readonly logout = async (c: Context) => {
        const body = await c.req.json<RefreshToken>()

        const parseResult = refreshTokenBody.safeParse(body)
        if (!parseResult.success) {
            return c.json({
                error: 'Validation failed',
                issues: parseResult.error.errors,
            }, 400)
        }

        try {
            await this.rabbitMQ.publish(QUEUES.AUTH.logout, body)
            return c.json(undefined, 200)
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