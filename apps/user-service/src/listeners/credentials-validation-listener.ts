import {RabbitmqRPCListener} from "./rabbitmq-listener";
import {Users} from "../db/users";
import bcrypt from "bcrypt";

export class CredentialsValidationListener implements RabbitmqRPCListener {

    constructor(private readonly users: Users) {}

    onMessage(msg: string, reply: (response: object) => void): void {
        const { email, password } = JSON.parse(msg)

        this.users.getByEmailIncludePassword(email)
            .then(user => {
                if (user.length === 0) {
                    return reply({
                        error: `No user was found with email ${email}`,
                        code: 404,
                    })
                }

                if (user.length > 1) {
                    return reply({
                        error: `Many users was found with email ${email}`,
                        code: 409,
                    })
                }

                const isMatch = bcrypt.compareSync(password, user[0].password)
                if (!isMatch) {
                    return reply({
                        error: 'Invalid credentials',
                        code: 400,
                    })
                }

                reply({
                    code: 200,
                })
            })
            .catch(err => {
                console.error(`Error while retrieve user data: ${err}`)
                reply({
                    error: 'Error while retrieve user data',
                    code: 500,
                })
            })
    }
}