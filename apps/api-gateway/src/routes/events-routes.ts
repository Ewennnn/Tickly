import {RoutesDeclarator} from "./routes-declarator";
import {Context, Hono} from "hono";
import {RabbitMQ} from "../config/rabbitmq";
import {createEventBody, patchEventBody} from "./validation/event-validation";
import {QUEUES} from "../config/env";
import {ContentfulStatusCode} from "hono/dist/types/utils/http-status";

export type Event = {
    id: string
    name: string
    description: string
    date: string
    seats: number
    location: string
    images: string[]
    createdAt: string
    isActive: boolean
}

type ServiceError = {
    error: string,
    code: ContentfulStatusCode,
}

type ServiceResponse = Event | ServiceError
type ServiceArrayResponse = Event[] | ServiceResponse

export class EventsRoutes implements RoutesDeclarator {

    constructor(private readonly app: Hono, private readonly rabbitMQ: RabbitMQ) {}

    declareRoutes(): void {
        this.app.post('/events', this.createEvent)
        this.app.get('/events', this.getActiveEvents)
        this.app.get('/events/all', this.getAllEvents)
        this.app.get('/events/:id', this.getEventById)
        this.app.patch('/events', this.updateEvent)
        this.app.delete('/events/:id', this.deleteEvent)
    }

    private readonly createEvent = async (c: Context) => {
        const body = await c.req.json<Event>()

        const parseResult = createEventBody.safeParse(body)
        if (!parseResult.success) {
            return c.json({
                error: 'Validation failed',
                issues: parseResult.error.errors,
            }, 400)
        }

        try {
            const response = await this.rabbitMQ.publishRPC<ServiceResponse>(QUEUES.EVENTS.create, body)
            return this.doResponse(c, response)
        } catch (err) {
            return c.json({ error: 'No response received from service' }, 500)
        }
    }

    private readonly getActiveEvents = async (c: Context) => {
        const { query } = c.req.query()

        try {
            const response = await this.rabbitMQ.publishRPC<ServiceArrayResponse>(QUEUES.EVENTS.get,  query ? { query } : { active: true })
            return this.doResponse(c, response)
        } catch (err) {
            return c.json({ error: 'No response received from service' }, 500)
        }
    }

    private readonly getAllEvents = async (c: Context) => {
        try {
            const response = await this.rabbitMQ.publishRPC<ServiceArrayResponse>(QUEUES.EVENTS.get, {})
            return this.doResponse(c, response)
        } catch (err) {
            return c.json({ error: 'No response received from service' }, 500)
        }
    }

    private readonly getEventById = async (c: Context) => {
        const id = c.req.param('id')

        try {
            const response = await this.rabbitMQ.publishRPC<ServiceArrayResponse>(QUEUES.EVENTS.get, { id })
            return this.doResponse(c, response)
        } catch (err) {
            return c.json({ error: 'No response received from service' }, 500)
        }
    }

    private readonly updateEvent = async (c: Context) => {
        const body = await c.req.json<Event>()

        const parseResult = patchEventBody.safeParse(body)
        if (!parseResult.success) {
            return c.json({
                message: 'Validation failed',
                issues: parseResult.error.errors
            }, 400)
        }

        try {
            const updatedUser = await this.rabbitMQ.publishRPC<ServiceResponse>(QUEUES.EVENTS.update, body)
            return this.doResponse(c, updatedUser)
        } catch (err) {
            return c.json({ error: 'No response received from service'}, 500)
        }
    }

    private readonly deleteEvent = async (c: Context) => {
        const { id } = c.req.param()

        try {
            const deletedUser = await this.rabbitMQ.publishRPC<ServiceResponse>(QUEUES.EVENTS.delete, { id })
            return this.doResponse(c, deletedUser)
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