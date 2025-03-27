import {RabbitmqRPCListener} from "./rabbitmq-listener";
import {Authentication} from "../db/authentication";
import jwt from "jsonwebtoken";
import {JWT_SECRET, QUEUES} from "../config/env";
import {RabbitMQ} from "../config/rabbitmq";

export class GetUserFromToken implements RabbitmqRPCListener {

    constructor(private readonly rabbitmq: RabbitMQ, private readonly authentication: Authentication) {}

    onMessage(msg: string, reply: (response: object) => void): void {
        const { refreshToken } = JSON.parse(msg)
        console.log(`Receive request to get user from refresh token`)

        if (!refreshToken) {
            return reply({
                error: 'No refresh token provided',
                code: 400,
            })
        }

        this.authentication.existsRefreshToken(refreshToken)
            .then(savedToken => {
                if (savedToken.length !== 1) {
                    return reply({
                        error: 'Invalid refresh token',
                        code: 400
                    })
                }

                jwt.verify(refreshToken, JWT_SECRET, (err: any , decoded: any) => {
                    if (err) {
                        return reply({
                            error: "Invalid refresh token",
                            code: 400,
                        })
                    }

                    this.rabbitmq.publishRPC<any>(QUEUES.USERS.get, { email: decoded.id })
                        .then(user => {
                            if (user) {
                                return reply(user)
                            }

                            reply({
                                error: 'User not retrieved',
                                code: 404,
                            })
                        })
                        .catch(err => {
                            console.log(`Failed to retrieve user from refresh token: ${err}`)
                            reply({
                                error: 'Failed to retrieve user from refresh token',
                                code: 500,
                            })
                        })
                })
            })
    }
}