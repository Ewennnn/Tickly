import {pgSchema, timestamp, uuid} from "drizzle-orm/pg-core";

export const eventSchema = pgSchema("tickets-service");

export const tickets = eventSchema.table("tickets", {
    id: uuid().primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull(),
    eventId: uuid("event_id").notNull(),
    bookedAt: timestamp("booked_at", { precision: 0 }).defaultNow().notNull(),
})