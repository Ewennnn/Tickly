import {RabbitmqRPCListener} from "./rabbitmq-listener";
import {Authentication} from "../db/authentication";
import {RabbitMQ} from "../config/rabbitmq";
import {JWT_SECRET, QUEUES} from "../config/env";
import jwt from 'jsonwebtoken'

const dayMultiplicator = 24 * 60 * 60 * 1000

type User = {
    id: string,
    name: string,
    age: number,
    email: string,
    role: 'ROLE_ADMIN' | 'ROLE_USER',
}

type ServiceError = {
    error: string,
    code: number,
}

type ServiceResponse = User | ServiceError

export class LoginUserListener implements RabbitmqRPCListener {

    constructor(private readonly rabbitMQ: RabbitMQ, private readonly authentication: Authentication) {}

    onMessage(msg: string, reply: (response: object) => void) {
        const { email, password } = JSON.parse(msg)
        console.log(`Receive request to log user with email ${email}`)

        if (!email || !password) {
            return reply({
                error: 'Full credentials not provided',
                code: 400,
            })
        }

        this.rabbitMQ.publishRPC<ServiceResponse>(QUEUES.USERS.get, { email })
            .then(user => {
                if (this.isError(user)) {
                    console.error(user)
                    return reply(user)
                }

                this.rabbitMQ.publishRPC<ServiceResponse>(QUEUES.USERS.validateCredentials, { email, password })
                    .then(status => {
                        if (this.isError(status)) {
                            console.error(status)
                            return reply(status)
                        }

                        const accessToken = jwt.sign({ id: user.email, role: user.role }, JWT_SECRET, { expiresIn: "15m" })
                        const refreshToken = jwt.sign({ id: user.email }, JWT_SECRET, { expiresIn: "7d" })

                        const expireAt = new Date(Date.now() + 7 * dayMultiplicator)
                        this.authentication.saveRefreshToken({
                            email: user.email,
                            token: refreshToken,
                            expireAt: expireAt
                        }).then(() => reply({ accessToken, refreshToken }))
                            .catch(err => {
                                console.error(`Failed to save refresh token for ${email}: ${err}`)
                                reply({
                                    error: 'Failed to save user refresh token',
                                    code: 500,
                                })
                            })
                    })
                    .catch(err => {
                        console.error(`Failed to validate user with email ${email}: ${err}`)
                        reply({
                            error: 'No response from User service',
                            code: 500,
                        })
                    })
            })
            .catch(err => {
                console.error(`Failed to retrieve user with email ${email}: ${err}`)
                reply({
                    error: 'No response from User service',
                    code: 500,
                })
            })
    }

    private isError(response: ServiceResponse): response is ServiceError {
        return (response as ServiceError).error !== undefined
            && (response as ServiceError).code !== undefined
    }
}

