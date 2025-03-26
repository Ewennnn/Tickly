import {RabbitmqListener} from "./rabbitmq-listener";
import {Tickets} from "../db/tickets";

export class DeleteFromEventListener implements RabbitmqListener {

    constructor(private readonly tickets: Tickets) {}

    onMessage(msg: string): void {
        const { eventId } = JSON.parse(msg)
        console.log(`Receive request to delete all tickets related to event ${eventId}`)

        if (!eventId) {
            console.warn("No event id provided")
            return
        }


        this.tickets.deleteRelatedToEvent(eventId)
            .then(deleted => console.log(`Successfully delete ${deleted.length} tickets related to ${eventId}`))
            .catch(err => console.error(`Failed to delete tickets related to event ${eventId}: ${err}`))
    }

}