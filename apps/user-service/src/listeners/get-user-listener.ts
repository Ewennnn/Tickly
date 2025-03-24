import {RabbitmqRPCListener} from "./rabbitmq-listener";
import {Users} from "../db/users";

export class GetUserListener implements RabbitmqRPCListener {

    constructor(private readonly users: Users) {}

    onMessage(msg: string, reply: (response: object) => void): void {
        const data = JSON.parse(msg)
        console.log(`Receive request to get user with id ${data.id}`)

        if (!data.id) {
            reply({
                error: 'No id provided to find user',
                code: 400,
            })
        }

        this.users.getById(data.id)
            .then(user => {
                if (user.length === 0) {
                    reply({
                        error: `Failed to retrieve user with id ${data.id}`,
                        code: 404,
                    })
                }

                if (user.length > 1) {
                    reply({
                        error: `Many users retrieved with id ${data.id}`,
                        code: 409,
                    })
                }

                reply(user[0])
            })
            .catch(err => {
                console.error(`Failed to retrieve user with id ${data.id}: ${err}`)
                reply({
                    error: `Failed to retrieve user with id ${data.id}`,
                    code: 500,
                })
            })
    }
}