import {RabbitmqRPCListener} from "./rabbitmq-listener";
import {Users} from "../db/users";

export class GetUserListener implements RabbitmqRPCListener {

    constructor(private readonly users: Users) {}

    onMessage(msg: string, reply: (response: object) => void): void {
        const { id, email } = JSON.parse(msg)
        if (!id && !email) {
            reply({
                error: 'No id or email provided to find user',
                code: 400,
            })
        }

        const data: string = id ?? email.toLowerCase()
        console.log(`Receive request to get user with id or email: ${data}`)

        let userPromise
        if (id) {
            userPromise = this.users.getById(id)
        } else {
            userPromise = this.users.getByEmail(email)
        }

        userPromise
            .then(user => {
                if (user.length === 0) {
                    reply({
                        error: `Failed to retrieve user with id or email ${data}`,
                        code: 404,
                    })
                }

                if (user.length > 1) {
                    reply({
                        error: `Many users retrieved with id or email ${data}`,
                        code: 409,
                    })
                }

                reply(user[0])
            })
            .catch(err => {
                console.error(`Failed to retrieve user with id or email ${data}: ${err}`)
                reply({
                    error: `Failed to retrieve user with id or email ${data}`,
                    code: 500,
                })
            })
    }
}