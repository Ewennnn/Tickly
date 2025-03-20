import {RabbitmqListener} from "./rabbitmq-listener";
import {NewUser, Users} from "../db/users";
import bcrypt from 'bcrypt'

export class CreateUserListener implements RabbitmqListener {

    constructor(private readonly users: Users) {
        console.log("Event handler initialized")
    }

    onMessage(msg: string) {
        console.log(`Message received: ${msg}`)

        const data = JSON.parse(msg)
        const newUser: NewUser = {
            ...data,
            password: bcrypt.hashSync(data.password, 10),
            role: "ROLE_USER"
        }

        console.log(newUser)
        this.users.add(newUser)
            .then(user => console.log(`New user registered with uuid ${user[0].id}`))
            .catch(err => console.error(`Error while insert new user ${err}`))
    }
}