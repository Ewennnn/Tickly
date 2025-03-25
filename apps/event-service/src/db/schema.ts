import {boolean, integer, json, pgSchema, text, timestamp, uuid} from "drizzle-orm/pg-core";

export const eventSchema = pgSchema("events-service");

export const events = eventSchema.table("events", {
    id: uuid().primaryKey().defaultRandom(),
    name: text().notNull(),
    description: text(),
    date: timestamp().notNull(),
    seats: integer().notNull(),
    location: text().notNull(),
    images: json().default([]),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    isActive: boolean("is_active").default(true),
})