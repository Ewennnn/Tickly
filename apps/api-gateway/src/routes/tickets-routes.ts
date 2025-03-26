import {RoutesDeclarator} from "./routes-declarator";
import {Context, Hono} from "hono";
import {RabbitMQ} from "../config/rabbitmq";
import {createTicketBody} from "./validation/ticket-validation";
import {ContentfulStatusCode} from "hono/dist/types/utils/http-status";
import {QUEUES} from "../config/env";

type Ticket = {
    id: string,
    userId: string,
    eventId: string,
    bookedAt: Date,
}

type ServiceError = {
    error: string,
    code: ContentfulStatusCode,
}

type ServiceResponse = Ticket | ServiceError
type ServiceArrayResponse = Ticket[] | ServiceResponse

export class TicketsRoutes implements RoutesDeclarator {

    constructor(private readonly app: Hono, private readonly rabbitMQ: RabbitMQ) {}

    declareRoutes(): void {
        this.app.post('/ticket', this.createTicket)
        this.app.get('/ticket', this.getTickets)
        this.app.delete('/ticket/:id', this.deleteTicket)
    }

    private readonly createTicket = async (c: Context) => {
        const body = await c.req.json();  // Récupérer le corps de la requête

        // Validation avec Zod
        const parseResult = createTicketBody.safeParse(body);
        if (!parseResult.success) {
            return c.json({
                error: 'Validation failed',
                issues: parseResult.error.errors,
            }, 400);
        }

        try {
            const { userId, eventId, bookedAt } = parseResult.data;
            const ticket = await this.rabbitMQ.publishRPC<ServiceResponse>(QUEUES.TICKETS.create, {
                userId,
                eventId,
                bookedAt,
            });

            return this.doResponse(c, ticket)
        } catch (err) {
            return c.json({ error: 'No response received from service' }, 500)
        }
    }

    private readonly getTickets = async (c: Context) => {
        const { id, userId, eventId } = c.req.query();

        const filters: Record<string, any> = {};
        if (id) filters.id = id
        if (userId) filters.userId = userId;
        if (eventId) filters.eventId = eventId;

        try {
            const tickets = await this.rabbitMQ.publishRPC<ServiceResponse | ServiceArrayResponse>(QUEUES.TICKETS.get, filters);
            return this.doResponse(c, tickets)
        } catch (err) {
            return c.json({ error: 'No response received from service' }, 500)
        }
    }

    private readonly deleteTicket = async (c: Context) => {
        const { id } = c.req.param()

        try {
            const deletedTicket = await this.rabbitMQ.publishRPC<ServiceResponse>(QUEUES.TICKETS.delete, { id })
            return this.doResponse(c, deletedTicket)
        } catch (err) {
            return c.json({ error: 'No response received from service'}, 500)
        }
    }

    private doResponse(c: Context, response: ServiceResponse | ServiceArrayResponse) {
        if (this.isError(response)) {
            return c.json({ error: response.error }, response.code)
        }
        return c.json(response)
    }

    private isError(response: ServiceResponse | ServiceArrayResponse): response is ServiceError {
        return (response as ServiceError).error !== undefined
            && (response as ServiceError).code !== undefined
    }
}