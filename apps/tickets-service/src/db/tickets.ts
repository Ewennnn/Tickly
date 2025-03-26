import {Pool} from "pg";
import {drizzle, NodePgDatabase} from "drizzle-orm/node-postgres";
import {tickets} from "./schema";
import {eq} from "drizzle-orm";

export type NewTicket = typeof tickets.$inferInsert

export class Tickets {

    private readonly db: NodePgDatabase;

    public constructor(url: string) {
        const pool = new Pool({
            connectionString: url,
            max: 20
        })
        this.db = drizzle({ client: pool })
    }

    public getAll() {
        return this.db
            .select()
            .from(tickets)
    }

    public getById(id: string) {
        return this.db
            .select()
            .from(tickets)
            .where(eq(tickets.id, id))
            .limit(1)
    }

    public getByUser(userId: string) {
        return this.db
            .select()
            .from(tickets)
            .where(eq(tickets.userId, userId))
    }

    public getByEvent(eventId: string) {
        return this.db
            .select()
            .from(tickets)
            .where(eq(tickets.eventId, eventId))
    }

    public async add(event: NewTicket) {
        return this.db
            .insert(tickets)
            .values(event)
            .returning()
    }

    public async delete(id: string) {
        return this.db
            .delete(tickets)
            .where(eq(tickets.id, id))
            .returning()
    }

    public async deleteRelatedToEvent(eventId: string) {
        return this.db
            .delete(tickets)
            .where(eq(tickets.eventId, eventId))
            .returning()
    }
}