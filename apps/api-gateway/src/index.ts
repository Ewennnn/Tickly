import {PORT, RABBITMQ_URL} from "./config/env";
import {Gateway} from "./server";

const gateway = new Gateway(PORT, RABBITMQ_URL)
gateway.start()
    .then(() => console.log("Gateway successfully started"))
    .catch(err => console.error(`Unable to start gateway: ${err}`))