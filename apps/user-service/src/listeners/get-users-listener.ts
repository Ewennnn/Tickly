import {RabbitmqRCPListener} from "./rabbitmq-listener";
import {Users} from "../db/users";

export class GetUsersListener implements RabbitmqRCPListener {

    constructor(private readonly users: Users) {}

    onMessage(msg: string, reply: (response: object) => void): void {
        console.log(`Receive message that waits for response: ${msg}`)

        this.users.all()
            .then(users => reply(users))
            .catch(err => console.error(`Error occurred while retrieve all users: ${err}`))
    }
}