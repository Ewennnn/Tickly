import {integer, pgSchema, text, uuid, varchar} from "drizzle-orm/pg-core";

export const usersSchema = pgSchema("users-service");

export const roleEnum = usersSchema.enum('role', ['ROLE_ADMIN', 'ROLE_USER'])

export const users = usersSchema.table("users", {
    id: uuid().primaryKey().defaultRandom(),
    name: varchar({length: 255}).notNull(),
    age: integer().notNull(),
    email: varchar().unique().notNull(),
    password: text().notNull(),
    role: roleEnum().notNull()
})