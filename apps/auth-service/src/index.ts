import {RabbitMQ} from "./config/rabbitmq";
import {DATABASE_URL, QUEUES, RABBITMQ_URL} from "./config/env";
import {Authentication} from "./db/authentication";
import {LoginUserListener} from "./listeners/login-user-listener";
import {RefreshTokenListener} from "./listeners/refresh-token-listener";
import {LogoutUserListener} from "./listeners/logout-user-listener";

(async () => {
    try {
        await main()
    } catch (err) {
        console.error("Error starting the service:", err);
    }
})()

async function main() {
    console.log("Starting Authentication Service...");

    const rabbitMQ = new RabbitMQ(RABBITMQ_URL)
    await rabbitMQ.connect()

    const authentication = new Authentication(DATABASE_URL)

    await rabbitMQ.consumeRPC(QUEUES.AUTH.login, (msg, reply) => new LoginUserListener(rabbitMQ, authentication).onMessage(msg, reply))
    await rabbitMQ.consumeRPC(QUEUES.AUTH.refreshToken, (msg, reply) => new RefreshTokenListener(authentication).onMessage(msg, reply))
    await rabbitMQ.consume(QUEUES.AUTH.logout, msg => new LogoutUserListener(rabbitMQ, authentication).onMessage(msg))
}