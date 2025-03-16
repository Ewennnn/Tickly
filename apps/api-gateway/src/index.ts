import {Hono} from "hono";
import {serve} from "@hono/node-server";

const app = new Hono()

app.get('/', c => {
    return c.json({
        message: 'Hello Hono !'
    })
})

serve({
    fetch: app.fetch,
    port: 3000
}, info => console.log(`Listening on http://localhost:${info.port}`))