import {RabbitmqListener} from "./rabbitmq-listener";
import {Tickets} from "../db/tickets";
import {RabbitMQ} from "../config/rabbitmq";
import {QUEUES} from "../config/env";

export class DeleteFromEventListener implements RabbitmqListener {

    constructor(private readonly rabbitmq: RabbitMQ, private readonly tickets: Tickets) {}

    onMessage(msg: string): void {
        const { eventId, name } = JSON.parse(msg)
        console.log(`Receive request to delete all tickets related to event ${eventId}`)

        if (!eventId) {
            console.warn("No event id provided")
            return
        }

        this.tickets.getByEvent(eventId)
            .then(async tickets => {
                for (let ticket of tickets) {
                    const user = await this.rabbitmq.publishRPC<{ email: string }>(QUEUES.USERS.get, { id: ticket.userId })

                    this.rabbitmq.publish(QUEUES.NOTIFICATION.sendEmail, {
                        to: user.email,
                        subject: 'Désinscription à un évènement',
                        content: `Votre désinscription pour l'évènement ${name} a bien été prise en compte`
                    }).then()
                }
            })

        this.tickets.deleteRelatedToEvent(eventId)
            .then(deleted => console.log(`Successfully delete ${deleted.length} tickets related to ${eventId}`))
            .catch(err => console.error(`Failed to delete tickets related to event ${eventId}: ${err}`))
    }

}