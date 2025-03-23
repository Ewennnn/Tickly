import {RabbitmqRCPListener} from "./rabbitmq-listener";
import {Users} from "../db/users";

export class UpdateUserListener implements RabbitmqRCPListener {

    constructor(private readonly users: Users) {}

    onMessage(msg: string, reply: (response: object) => void): void {
        console.log(`Message received: ${msg}`)

        const updated = JSON.parse(msg)
        console.log(updated)

        this.users.update(updated)
            .then(user => {
                if (user.length === 0) {
                    throw new Error('No user was updated')
                }
                console.log(`Successfully update user with id ${user[0].id}`)
                reply(user)
            })
            .catch(err => {
                console.error(`Failed to update user: ${err}`)
                reply({ error: `Failed to update user with id ${updated.id}` })
            })
    }
}