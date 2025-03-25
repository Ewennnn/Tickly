import {RabbitmqRPCListener} from "./rabbitmq-listener";
import {Users} from "../db/users";
import {RabbitMQ} from "../config/rabbitmq";
import {QUEUES} from "../config/env";

export class DeleteUserListener implements RabbitmqRPCListener {

    constructor(private readonly rabbitMQ: RabbitMQ, private readonly users: Users) {}

    onMessage(msg: string, reply: (response: object) => void): void {
        const { id } = JSON.parse(msg)

        if (!id) {
            return reply({
                error: "No id provided",
                code: 400
            })
        }

        console.log(`Receive request to delete user with id ${id}`)
        this.users.delete(id)
            .then(user => {
                if (user.length === 0) {
                    reply({
                        error: `No user was deleted with id ${id}`,
                        code: 404,
                    })
                    return
                }

                if (user.length > 1) {
                    reply({
                        error: `Many users was deleted with id ${id}`,
                        code: 409,
                    })
                    return
                }

                this.rabbitMQ.publish(QUEUES.NOTIFICATION.sendEmail, {
                    to: user[0].email,
                    name: user[0].name,
                    subject: 'A bientôt sur Tickly !',
                    content: 'Votre compte a été supprimé.\nNous sommes triste de vous voir partir :( Nous espérons vous revoir prochainement !'
                }).then()

                console.log('Successfully delete user: `')
                console.log(user[0])
                reply(user[0])
            })
            .catch(err => {
                console.error(`Failed to delete user with id ${id}: ${err}`)
                reply({
                    error: `Failed to delete user with id ${id}`,
                    code: 500,
                })
            })
    }
}