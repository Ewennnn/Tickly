import {AnyPgColumn, integer, pgSchema, text, uniqueIndex, uuid, varchar} from "drizzle-orm/pg-core";
import {sql, SQL} from "drizzle-orm";

export const usersSchema = pgSchema("users-service");

export const roleEnum = usersSchema.enum('role', ['ROLE_ADMIN', 'ROLE_USER'])

export const users = usersSchema.table("users", {
    id: uuid().primaryKey().defaultRandom(),
    name: varchar({length: 255}).notNull(),
    age: integer().notNull(),
    email: varchar().notNull(),
    password: text().notNull(),
    role: roleEnum().notNull()
}, (table) => [
    uniqueIndex('emailUniqueIndex').on(lower(table.email))
])

export function lower(email: AnyPgColumn): SQL {
    return sql`lower(${email})`
}