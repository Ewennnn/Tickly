import {RabbitmqRPCListener} from "./rabbitmq-listener";
import {Tickets} from "../db/tickets";

export class DeleteTicketListener implements RabbitmqRPCListener {

    constructor(private readonly tickets: Tickets) {}

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