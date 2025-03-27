import {RabbitmqRPCListener} from "./rabbitmq-listener";
import {Tickets} from "../db/tickets";
import {QUEUES} from "../config/env";
import {RabbitMQ} from "../config/rabbitmq";

export class DeleteTicketListener implements RabbitmqRPCListener {

    constructor(private readonly rabbitmq: RabbitMQ, private readonly tickets: Tickets) {}

    onMessage(msg: string, reply: (response: object) => void): void {
        const { id } = JSON.parse(msg)

        if (!id) {
            return reply({
                error: 'Id is required to delete ticket',
                code: 400,
            })
        }

        this.tickets.delete(id)
            .then(ticket => {
                if (ticket.length === 0) {
                    return reply({
                        error: `No event was deleted with id ${id}`,
                        code: 404,
                    })
                }

                if (ticket.length > 1) {
                    return reply({
                        error: `Many event was deleted with id ${id}`,
                        code: 409,
                    })
                }

                this.rabbitmq.publishRPC<{ name: string }>(QUEUES.EVENTS.get, { id: ticket[0].eventId })
                    .then(event => {
                        console.log(event)

                        this.rabbitmq.publishRPC<{ email: string }>(QUEUES.USERS.get, { id: ticket[0].userId })
                            .then(user => {

                                this.rabbitmq.publish(QUEUES.NOTIFICATION.sendEmail, {
                                    to: user.email,
                                    subject: 'Désinscription à un évènement',
                                    content: `Votre désinscription pour l'évènement ${event.name} a bien été prise en compte`
                                }).then()
                            })
                    })

                console.log('Successfully delete ticket: ')
                console.log(ticket[0])
                reply(ticket[0])
            })
            .catch(err => {
                console.error(`Failed to delete ticket with id ${id}: ${err}`)
                reply({
                    error: `Failed to delete ticket with id ${id}`,
                    code: 500,
                })
            })
    }
}