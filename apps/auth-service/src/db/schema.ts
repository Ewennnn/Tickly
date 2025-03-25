import {AnyPgColumn, pgSchema, text, timestamp, uniqueIndex, uuid} from "drizzle-orm/pg-core";
import {sql, SQL} from "drizzle-orm";

export const refreshTokensSchema = pgSchema("refresh_tokens")

export const refreshTokens = refreshTokensSchema.table("refresh_tokens", {
    id: uuid().primaryKey().defaultRandom(),
    email: text().unique().notNull(),
    token: text().unique().notNull(),
    expireAt: timestamp("expires_at", { precision: 0, withTimezone: false }).notNull(),
    createdAt: timestamp("created_at", { precision: 0, withTimezone: false}).defaultNow().notNull()
}, (table) => [
    uniqueIndex('emailUniqueIndex').on(lower(table.email))
])

export function lower(email: AnyPgColumn): SQL {
    return sql`lower(${email})`
}