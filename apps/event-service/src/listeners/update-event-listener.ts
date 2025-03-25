import {RabbitmqRPCListener} from "./rabbitmq-listener";
import {Events} from "../db/events";

export class UpdateEventListener implements RabbitmqRPCListener {

    constructor(private readonly events: Events) {}

    onMessage(msg: string, reply: (response: object) => void): void {
        const { id, name, description, date, seats, location, images, isActive } = JSON.parse(msg)
        const updatedEvent = {
            id,
            name,
            description,
            date: date ? new Date(Date.parse(date)) : undefined,
            seats,
            location,
            images,
            isActive,
        }

        this.events.update(updatedEvent)
            .then(event => {
                if (event.length === 0) {
                    return reply({
                        error: `No event was updated with id ${id}`,
                        code: 404,
                    })
                }

                if (event.length > 1) {
                    return reply({
                        error: `Many events was updated with id ${id}`,
                        code: 409,
                    })
                }

                console.log('Successfully update event:')
                console.log(event[0])
                reply(event[0])
            })
            .catch(err => {
                console.error(`Failed to update event: ${err}`)
                reply({
                    error: `Failed to update event with id ${id}`,
                    code: 500
                })
            })
    }
}