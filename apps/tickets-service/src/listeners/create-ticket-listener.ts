import {RabbitmqRPCListener} from "./rabbitmq-listener";
import {NewTicket, Tickets} from "../db/tickets";
import {RabbitMQ} from "../config/rabbitmq";
import {QUEUES} from "../config/env";

export class CreateTicketListener implements RabbitmqRPCListener {

    constructor(private readonly rabbitMQ: RabbitMQ, private readonly tickets: Tickets) {}

    onMessage(msg: string, reply: (response: object) => void): void {
        const { userId, eventId, bookedAt } = JSON.parse(msg)
        const newTicket: NewTicket = {
            userId,
            eventId,
            bookedAt
        }

        this.rabbitMQ.publishRPC<{ id: string, name: string, email: string }>(QUEUES.USERS.get, { id: userId })
            .then(user => {
                if (!user.id) {
                    return reply({
                        error: `User with id ${userId} does not exists`,
                        code: 400
                    })
                }
                console.log(`Successfully retrieve user ${user.name}`)

                this.rabbitMQ.publishRPC<{ id: string, name: string, isActive: boolean }>(QUEUES.EVENTS.get, { id: eventId })
                    .then(event => {
                        if (!event.id) {
                            return reply({
                                error: `Event with id ${eventId} does not exists`,
                                code: 400,
                            })
                        }
                        if (!event.isActive) {
                            return reply({
                                error: `Event with id ${event.id} is not active`,
                                code: 400,
                            })
                        }
                        console.log(`Successfully retrieve event ${event.name}`)

                        this.tickets.add(newTicket)
                            .then(ticket => {
                                if (ticket.length === 0) {
                                    return reply({
                                        error: `No ticket was created`,
                                        code: 400,
                                    })
                                }

                                if (ticket.length > 1) {
                                    return reply({
                                        error: 'Many tickets was created',
                                        code: 409,
                                    })
                                }

                                this.rabbitMQ.publish(QUEUES.NOTIFICATION.sendEmail, {
                                    to: user.email,
                                    subject: 'Inscription à un évènement',
                                    content: `Votre inscription pour l'évènement ${event.name} a bien été prise en compte`
                                }).then()

                                console.log('New ticket created:')
                                console.log(ticket[0])
                                reply(ticket[0])
                            })
                            .catch(err => {
                                console.error(`Error while insert new ticket: ${err}`)
                                reply({
                                    error: 'Failed to save ticket',
                                    code: 500,
                                })
                            })
                    })
                    .catch(err => {
                    console.error(`Error while try to retrieve event: ${err}`)
                    reply({
                        error: 'Failed to retrieve event',
                        code: 500,
                    })
                })
            })
            .catch(err => {
                console.error(`Error while try to retrieve user: ${err}`)
                reply({
                    error: 'Failed to retrieve user',
                    code: 500,
                })
            })
    }
}