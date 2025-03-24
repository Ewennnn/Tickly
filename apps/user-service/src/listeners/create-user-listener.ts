import {RabbitmqRPCListener} from "./rabbitmq-listener";
import {NewUser, Users} from "../db/users";
import bcrypt from 'bcrypt'

export class CreateUserListener implements RabbitmqRPCListener {

    constructor(private readonly users: Users) {}

    onMessage(msg: string, reply: (response: object) => void) {
        const { name, age, email, password } = JSON.parse(msg)

        const newUser: NewUser = {
            name,
            age,
            email: email.toLowerCase(),
            password: bcrypt.hashSync(password, 10),
            role: "ROLE_USER"
        }

        this.users.add(newUser)
            .then(user => {
                if (user.length === 0) {
                    reply({
                        error: `No user was created`,
                        code: 400,
                    })
                    return
                }

                if (user.length > 1) {
                    reply({
                        error: 'Many users was created',
                        code: 409,
                    })
                    return
                }

                console.log('New user registered:')
                console.log(user[0])
                reply(user[0])
            })
            .catch(err => {
                console.error(`Error while insert new user ${err}`)
                reply({
                    error: 'This email is already registered',
                    code: 409,
                })
            })
    }
}