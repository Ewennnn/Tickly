import {RabbitmqRPCListener} from "./rabbitmq-listener";
import {Events} from "../db/events";
import {RabbitMQ} from "../config/rabbitmq";
import {QUEUES} from "../config/env";

export class DeleteEventListener implements RabbitmqRPCListener {

    constructor(private readonly rabbitmq: RabbitMQ, private readonly events: Events) {}

    onMessage(msg: string, reply: (response: object) => void): void {
        const { id } = JSON.parse(msg)

        if (!id) {
            return reply({
                error: 'Id is required to delete event',
                code: 400,
            })
        }

        this.events.delete(id)
            .then(event => {
                if (event.length === 0) {
                    return reply({
                        error: `No event was deleted with id ${id}`,
                        code: 404,
                    })
                }

                if (event.length > 1) {
                    return reply({
                        error: `Many event was deleted with id ${id}`,
                        code: 409,
                    })
                }

                this.rabbitmq.publish(QUEUES.TICKETS.deleteRelatedToEvent, { eventId: event[0].id, name: event[0].name })
                    .catch(err => console.error(`Error while sending delete tickets related to event ${event[0].id}: ${err}`))

                console.log('Successfully delete event: `')
                console.log(event[0])
                reply(event[0])
            })
            .catch(err => {
                console.error(`Failed to delete event with id ${id}: ${err}`)
                reply({
                    error: `Failed to delete event with id ${id}`,
                    code: 500,
                })
            })
    }
}