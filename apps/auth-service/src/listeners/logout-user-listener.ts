import {RabbitmqListener} from "./rabbitmq-listener";
import {Authentication} from "../db/authentication";
import jwt from "jsonwebtoken";
import {RabbitMQ} from "../config/rabbitmq";
import {QUEUES} from "../config/env";

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

export class LogoutUserListener implements RabbitmqListener {

    constructor(private readonly rabbitMQ: RabbitMQ, private readonly authentication: Authentication) {}

    onMessage(msg: string): void {
        const { refreshToken } = JSON.parse(msg)

        if (!refreshToken) {
            console.warn("No refresh token provided to logout")
            return
        }

        const token = jwt.decode(refreshToken) as { id: string }


        this.rabbitMQ.publishRPC<ServiceResponse>(QUEUES.USERS.get, { email: token.id })
            .then(user => {
                if (this.isError(user)) {
                    console.error(user)
                    return
                }

                this.authentication.existsRefreshToken(refreshToken)
                    .then(savedToken => {
                        if (savedToken.length !== 1) {
                            console.error("Trying to delete non existing refresh token")
                            return
                        }

                        this.authentication.invalidateRefreshToken(user.email)
                            .then(() => console.log(`Successfully invalidate refresh token for user ${user.email}`))
                            .catch(err => console.error(`Error while deleting refresh token for user ${user.email}: ${err}`))
                    })
                })
    }

    private isError(response: ServiceResponse): response is ServiceError {
        return (response as ServiceError).error !== undefined
            && (response as ServiceError).code !== undefined
    }
}