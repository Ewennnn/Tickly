import {RabbitmqRPCListener} from "./rabbitmq-listener";
import {Events} from "../db/events";

export class GetEventListener implements RabbitmqRPCListener {

    constructor(private readonly events: Events) {}

    onMessage(msg: string, reply: (response: object) => void): void {
        const { id, query, active } = JSON.parse(msg);

        let request
        if (id) {
            console.log(`Receive request to get event with id ${id}`)
            request = this.events.getById(id)
        } else if (query) {
            console.log(`Receive request to get event from query '${query}'`)
            request = this.events.getByQuery(query)
        } else if (active) {
            console.log(`Receive request to get all active events`)
            request = this.events.getAllActive()
        } else {
            console.log(`Receive request to get all events`)
            request = this.events.getAll()
        }

        request.then(events => {
            if (id && events.length > 0) {
                return reply(events[0])
            }

            reply(events)
        }).catch(err => {
            console.error(`Failed to get events with filters:
                - id: ${id},
                - query: ${query},
                - active: ${active}
                
                ${err}
            `)

            reply({
                error: 'Error while retrieve events',
                code: 500,
            })
        })
    }
}