import {Pool} from "pg";
import {drizzle, NodePgDatabase} from "drizzle-orm/node-postgres";
import {lower, refreshTokens} from "./schema";
import {eq, getTableColumns} from "drizzle-orm";

export type Token = typeof refreshTokens.$inferSelect
export type NewToken = typeof refreshTokens.$inferInsert

export class Authentication {

    private readonly db: NodePgDatabase;

    public constructor(url: string) {
        const pool = new Pool({
            connectionString: url,
            max: 20
        })
        this.db = drizzle({ client: pool })
    }

    public saveRefreshToken(savedToken: NewToken) {
        return this.db
            .insert(refreshTokens)
            .values(savedToken)
            .onConflictDoUpdate({
                target: refreshTokens.email,
                set: {
                    token: savedToken.token,
                    createdAt: new Date(Date.now()),
                    expireAt: savedToken.expireAt
                }
            })
            .returning()
    }

    public existsRefreshToken(refreshToken: string) {
        const { token } = getTableColumns(refreshTokens)
        return this.db
            .select({ token })
            .from(refreshTokens)
            .where(eq(refreshTokens.token, refreshToken))
    }

    public invalidateRefreshToken(email: string) {
        return this.db
            .delete(refreshTokens)
            .where(eq(lower(refreshTokens.email), email.toLowerCase()))
            .returning()
    }
}