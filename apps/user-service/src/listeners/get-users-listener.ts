import {RabbitmqRCPListener} from "./rabbitmq-listener";
import {Users} from "../db/users";

export class GetUsersListener implements RabbitmqRCPListener {

    constructor(private readonly users: Users) {}

    onMessage(msg: string, reply: (response: object) => void): void {
        console.log(`Receive request to get all users`)

        this.users.all()
            .then(users => reply(users))
            .catch(err => console.error(`Error occurred while retrieve all users: ${err}`))
    }
}