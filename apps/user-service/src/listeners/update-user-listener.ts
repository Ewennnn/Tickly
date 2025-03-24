import {RabbitmqRPCListener} from "./rabbitmq-listener";
import {User, Users} from "../db/users";
import bcrypt from "bcrypt";

export class UpdateUserListener implements RabbitmqRPCListener {

    constructor(private readonly users: Users) {}

    onMessage(msg: string, reply: (response: object) => void): void {
        const { id, name, age, email, password, role } = JSON.parse(msg)

        const updated: User = {
            id,
            name,
            age,
            email: email?.toLowerCase(),
            password: bcrypt.hashSync(password, 10),
            role: role,
        }

        this.users.update(updated)
            .then(user => {
                if (user.length === 0) {
                    return reply({
                        error: `No user was updated with id ${id}`,
                        code: 404,
                    })
                }

                if (user.length > 1) {
                    return reply({
                        error: `Many users was updated with id ${id}`,
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
                    error: `Failed to update user with id ${id}`,
                    code: 500
                })
            })
    }
}