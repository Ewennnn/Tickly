import {RabbitmqRPCListener} from "./rabbitmq-listener";
import {Users} from "../db/users";

export class GetUsersListener implements RabbitmqRPCListener {

    constructor(private readonly users: Users) {}

    onMessage(msg: string, reply: (response: object) => void): void {
        console.log(`Receive request to get all users`)

        this.users.all()
            .then(users => reply(users))
            .catch(err => {
                console.error(`Error occurred while retrieve all users: ${err}`)
                reply({
                    error: `Failed to retrieve users`,
                    code: 500,
                })
            })
    }
}