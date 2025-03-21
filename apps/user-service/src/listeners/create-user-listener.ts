import {RabbitmqRCPListener} from "./rabbitmq-listener";
import {NewUser, Users} from "../db/users";
import bcrypt from 'bcrypt'

export class CreateUserListener implements RabbitmqRCPListener {

    constructor(private readonly users: Users) {}

    onMessage(msg: string, reply: (response: object) => void) {
        console.log(`Message received: ${msg}`)

        const data = JSON.parse(msg)
        const newUser: NewUser = {
            ...data,
            password: bcrypt.hashSync(data.password, 10),
            role: "ROLE_USER"
        }

        console.log(newUser)
        this.users.add(newUser)
            .then(user => {
                console.log(`New user registered with uuid ${user[0].id}`)
                reply(user)
            })
            .catch(err => {
                console.error(`Error while insert new user ${err}`)
                reply({ error: 'This email is already registered' })
            })
    }
}