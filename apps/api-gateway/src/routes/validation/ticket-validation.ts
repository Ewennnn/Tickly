import {z} from "zod";

export const createTicketBody = z.object({
    userId: z.string().uuid(),
    eventId: z.string().uuid(),
    bookedAt: z.string().optional(),  // Ce n'est pas obligatoire, donc on l'optionnalise
}).strict();