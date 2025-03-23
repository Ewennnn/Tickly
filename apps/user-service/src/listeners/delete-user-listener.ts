import {RabbitmqListener} from "./rabbitmq-listener";
import {Users} from "../db/users";

export class DeleteUserListener implements RabbitmqListener {

    constructor(private readonly users: Users) {}


    onMessage(msg: string): void {
        console.log(msg)

        const data = JSON.parse(msg)

        if (data.id) {
            this.users.delete(data.id)
                .then(user => console.log(`Successfully delete user with id ${user[0].id}`))
                .catch(err => console.error(`Failed to delete user with id ${data.id}: ${err}`))
        }
    }
}