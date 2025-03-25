import {z} from "zod";

export const createEventBody = z.object({
    name: z.string().min(1, 'Name is required'),
    description: z.string().min(1, 'Description is required'),
    date: z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: 'Date must be a valid date string',
    }),
    seats: z.number().min(1, 'Max seats must be at least 1'),
    location: z.string().min(1, 'Location is required'),
    images: z.array(z.string()).optional(),
    isActive: z.boolean().optional(),
}).strict()

export const patchEventBody = z.object({
    id: z.string().trim().uuid(),
    name: z.string().min(1, 'Name is required'),
    description: z.string().min(1, 'Description is required'),
    date: z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: 'Date must be a valid date string',
    }),
    seats: z.number().min(1, 'Max seats must be at least 1'),
    location: z.string().min(1, 'Location is required'),
    images: z.array(z.string()).optional(),
    isActive: z.boolean().optional(),
})