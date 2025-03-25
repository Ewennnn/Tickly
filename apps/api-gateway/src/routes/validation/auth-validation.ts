import {z} from "zod";

export const credentialsBody = z.object({
    email: z.string().email(),
    password: z.string(),
}).strict()

export const refreshTokenBody = z.object({
    refreshToken: z.string()
}).strict()