import {RabbitmqRCPListener} from "./rabbitmq-listener";
import {Users} from "../db/users";

export class UpdateUserListener implements RabbitmqRCPListener {

    constructor(private readonly users: Users) {}

    onMessage(msg: string, reply: (response: object) => void): void {
        const updated = JSON.parse(msg)

        this.users.update(updated)
            .then(user => {
                if (user.length === 0) {
                    reply({
                        error: `No user was updated with id ${updated.id}`,
                        code: 404,
                    })
                }

                if (user.length > 1) {
                    reply({
                        error: `Many users was updated with id ${updated.id}`,
                        code: 409,
                    })
                }
                console.log('Successfully update user:')
                console.log(user[0])
                reply(user[0])
            })
            .catch(err => {
                console.error(`Failed to update user: ${err}`)
                reply({
                    error: `Failed to update user with id ${updated.id}`,
                    code: 500
                })
            })
    }
}