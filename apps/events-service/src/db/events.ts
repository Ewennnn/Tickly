import {Pool} from "pg";
import {drizzle, NodePgDatabase} from "drizzle-orm/node-postgres";
import {events} from "./schema";
import {eq, ilike} from "drizzle-orm";

export type Event = typeof events.$inferSelect
export type NewEvent = typeof events.$inferInsert

export class Events {

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
            .from(events)
    }

    public getAllActive() {
        return this.db
            .select()
            .from(events)
            .where(eq(events.isActive, true))
    }

    public getById(id: string) {
        return this.db
            .select()
            .from(events)
            .where(eq(events.id, id))
            .limit(1)
    }

    public getByQuery(query: string) {
        return this.db
            .select()
            .from(events)
            .where(ilike(events.name, `%${query}%`))
    }

    public async add(event: NewEvent) {
        return this.db
            .insert(events)
            .values(event)
            .returning()
    }

    public async update(event: Partial<Event>) {
        return this.db
            .update(events)
            .set(event)
            .where(eq(events.id, event.id!))
            .returning()
    }

    public async delete(id: string) {
        return this.db
            .delete(events)
            .where(eq(events.id, id))
            .returning()
    }
}