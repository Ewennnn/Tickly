import {Pool} from "pg";
import {drizzle, NodePgDatabase} from "drizzle-orm/node-postgres";
import {users} from "./schema";
import {getTableColumns} from "drizzle-orm";

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
        return this.db.select({ ...content }).from(users).execute()
    }

    public async add(user: NewUser) {
        const { password, ...content } = getTableColumns(users)
        return this.db.insert(users).values(user).returning({ ...content })
    }
}