import {Pool} from "pg";
import {drizzle, NodePgDatabase} from "drizzle-orm/node-postgres";
import {lower, users} from "./schema";
import {eq, getTableColumns} from "drizzle-orm";

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert

export class Users {

    private readonly db: NodePgDatabase;

    public constructor(url: string) {
        const pool = new Pool({
            connectionString: url,
            max: 20
        })
        this.db = drizzle({ client: pool })
    }

    public all() {
        const { password, ...content } = getTableColumns(users)
        return this.db
            .select({ ...content })
            .from(users).execute()
    }

    public getById(id: string) {
        const { password, ...content } = getTableColumns(users)
        return this.db
            .select({ ...content })
            .from(users)
            .where(eq(users.id, id))
    }

    public getByEmail(email: string) {
        const { password, ...content } = getTableColumns(users)
        return this.db
            .select({ ...content })
            .from(users)
            .where(eq(lower(users.email), email.toLowerCase()))
    }

    public getByEmailIncludePassword(email: string) {
        return this.db
            .select({ ...getTableColumns(users) })
            .from(users)
            .where(eq(lower(users.email), email.toLowerCase()))
    }

    public async add(user: NewUser) {
        const { password, ...content } = getTableColumns(users)
        return this.db
            .insert(users)
            .values(user)
            .returning({ ...content })
    }

    public async update(user: Partial<User>) {
        const { password, ...content } = getTableColumns(users)
        return this.db
            .update(users)
            .set(user)
            .where(eq(users.id, user.id!))
            .returning({ ...content })
    }

    public async delete(id: string) {
        const { password, ...content } = getTableColumns(users)
        return this.db
            .delete(users)
            .where(eq(users.id, id))
            .returning({ ...content })
    }
}