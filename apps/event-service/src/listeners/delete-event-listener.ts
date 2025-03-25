import {RabbitmqRPCListener} from "./rabbitmq-listener";
import {Events} from "../db/events";

export class DeleteEventListener implements RabbitmqRPCListener {

    constructor(private readonly events: Events) {}

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