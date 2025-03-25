import {RabbitmqRPCListener} from "./rabbitmq-listener";
import {Authentication} from "../db/authentication";
import jwt from "jsonwebtoken";
import {JWT_SECRET} from "../config/env";

export class RefreshTokenListener implements RabbitmqRPCListener {

    constructor(private readonly authentication: Authentication) {}

    onMessage(msg: string, reply: (response: object) => void): void {
        const { refreshToken } = JSON.parse(msg)
        console.log(`Receive request to refresh token`)

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

                    const newAccessToken = jwt.sign({ id: decoded.id }, JWT_SECRET, { expiresIn: "15m" })
                    reply({ accessToken: newAccessToken })
                })
            })
    }
}