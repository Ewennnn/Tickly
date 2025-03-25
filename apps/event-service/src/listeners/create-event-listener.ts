import {RabbitmqRPCListener} from "./rabbitmq-listener";
import {Events, NewEvent} from "../db/events";

export class CreateEventListener implements RabbitmqRPCListener {

    constructor(private readonly events: Events) {}

    onMessage(msg: string, reply: (response: object) => void): void {
        const { name, description, date, seats, location, images, isActive } = JSON.parse(msg)
        const newEvent: NewEvent = {
            name,
            description,
            date: new Date(Date.parse(date)),
            seats,
            location,
            images,
            isActive
        }

        console.log(newEvent)
        this.events.add(newEvent)
            .then(event => {
                if (event.length === 0) {
                    return reply({
                        error: `No event was created`,
                        code: 400,
                    })
                }

                if (event.length > 1) {
                    return reply({
                        error: 'Many events was created',
                        code: 409,
                    })
                }

                console.log('New event created:')
                console.log(event[0])
                reply(event[0])
            })
            .catch(err => {
                console.error(`Error while insert new event: ${err}`)
                reply({
                    error: 'Failed to save event',
                    code: 500,
                })
            })
    }
}