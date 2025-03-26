import {RabbitmqRPCListener} from "./rabbitmq-listener";
import {Tickets} from "../db/tickets";

export class GetTicketListener implements RabbitmqRPCListener {

    constructor(private readonly tickets: Tickets) {}

    onMessage(msg: string, reply: (response: object) => void): void {
        const { id, eventId, userId } = JSON.parse(msg);

        let request
        if (id) {
            console.log(`Receive request to get ticket with id ${id}`)
            request = this.tickets.getById(id)
        } else if (eventId) {
            console.log(`Receive request to get tickets of event '${eventId}'`)
            request = this.tickets.getByEvent(eventId)
        } else if (userId) {
            console.log(`Receive request to get tickets of user: ${userId}`)
            request = this.tickets.getByUser(userId)
        } else {
            console.log(`Receive request to get all tickets`)
            request = this.tickets.getAll()
        }

        request.then(tickets => {
            if (id) {
                if (tickets.length === 0) {
                    return reply({
                        error: `No ticket found with id ${id}`,
                        code: 404,
                    })
                } else {
                    return reply(tickets[0])
                }
            }

            reply(tickets)
        }).catch(err => {
            console.error(`Failed to get tickets with filters:
                - id: ${id},
                - userId: ${userId},
                - eventId: ${eventId}
                
                ${err}
            `)

            reply({
                error: 'Error while retrieve events',
                code: 500,
            })
        })
    }
}