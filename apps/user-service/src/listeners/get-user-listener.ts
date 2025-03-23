import {RabbitmqRCPListener} from "./rabbitmq-listener";
import {Users} from "../db/users";

export class GetUserListener implements RabbitmqRCPListener {

    constructor(private readonly users: Users) {}

    onMessage(msg: string, reply: (response: object) => void): void {
        const data = JSON.parse(msg)

        if (!data.id) {
            reply({ error: 'No id provided to find user' })
        }

        this.users.getById(data.id)
            .then(user => {
                reply(user)
            })
            .catch(err => {
                console.error(`Failed to retrieve user with id ${data.id}: ${err}`)
                reply({ error: `Failed to retrieve user with id ${data.id}`})
            })
    }

}