import {z} from "zod";

export const createUserBody = z.object({
    name: z.string().min(1, "Name is required"),
    age: z.number().min(0, "Age must be a positive number"),
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
}).strict()

export const patchUserBody = z.object({
    id: z.string().trim().uuid(),
    name: z.string().min(1, "Name is required").optional(),
    age: z.number().min(0, "Age must be a positive number").optional(),
    email: z.string().email("Invalid email format").optional(),
    password: z.string().min(6, "Password must be at least 6 characters long").optional(),
})