import {Hono} from "hono";
import {serve} from "@hono/node-server";
import dotenv from 'dotenv'

dotenv.config()
const app = new Hono()

const secret = process.env.SECRET_WORD ?? "No word defined"

app.get('/', c => {
    return c.json({
        message: 'Hello Hono !',
        secret: secret,
    })
})

serve({
    fetch: app.fetch,
    port: 3000
}, info => console.log(`Listening on http://localhost:${info.port}`))