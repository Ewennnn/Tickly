import {RabbitmqRCPListener} from "./rabbitmq-listener";
import {Users} from "../db/users";

export class DeleteUserListener implements RabbitmqRCPListener {

    constructor(private readonly users: Users) {}


    onMessage(msg: string, reply: (response: object) => void): void {
        const data = JSON.parse(msg)

        if (!data.id) {
            reply({
                error: "No id provided",
                code: 400
            })
        }

        this.users.delete(data.id)
            .then(user => {
                if (user.length === 0) {
                    reply({
                        error: `No user was deleted with id ${data.id}`,
                        code: 404,
                    })
                    return
                }

                if (user.length > 1) {
                    reply({
                        error: `Many users was deleted with id ${data.id}`,
                        code: 409,
                    })
                    return
                }

                console.log('Successfully delete user: `')
                console.log(user[0])
                reply(user[0])
            })
            .catch(err => {
                console.error(`Failed to delete user with id ${data.id}: ${err}`)
                reply({
                    error: `Failed to delete user with id ${data.id}`,
                    code: 500,
                })
            })
    }
}