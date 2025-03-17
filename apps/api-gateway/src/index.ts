import {Hono} from "hono";
import {serve} from "@hono/node-server";
import dotenv from 'dotenv'
import {sendMessage} from "./queue";

dotenv.config()
const app = new Hono()

const secret = process.env.SECRET_WORD ?? "No word defined"

app.post('/', async c => {
    const body = await c.req.json()
    console.log(body)
    await sendMessage("user_queue", body.message as string)
    return c.json({
        message: 'Hello Hono !',
        secret: secret,
    })
})

serve({
    fetch: app.fetch,
    port: 3000
}, info => console.log(`Listening on http://localhost:${info.port}`))