import {RabbitmqListener} from "./rabbitmq-listener";
import {MailtrapClient} from "mailtrap";
import {EMAIL_SENDER, EMAIL_SENDER_NAME, QUEUES} from "../config/env";
import path from "node:path";
import * as fs from "node:fs";
import * as Handlebars from 'handlebars';
import {RabbitMQ} from "../config/rabbitmq";

export class SendEmailListener implements RabbitmqListener {

    private readonly template: HandlebarsTemplateDelegate

    constructor(private readonly rabbitMQ: RabbitMQ, private readonly mailClient: MailtrapClient) {
        const templatePath = path.join(__dirname, '../assets/template.hbs');
        const templateContent = fs.readFileSync(templatePath, 'utf-8');
        this.template = Handlebars.compile(templateContent)
    }

    onMessage(msg: string): void {
        const { to, name, subject, content } = JSON.parse(msg)
        console.log(`Message received to send email to ${to}`)

        if ( !to || !subject || !content) {
            console.error('All required data not provided to send email')
            return
        }

        let userPromise
        if (!name) {
            userPromise = this.rabbitMQ.publishRPC<{ name: string }>(QUEUES.USERS.get, { email: to })
        } else {
            userPromise = Promise.resolve({name})
        }

        userPromise
            .then(user => {
                const html = this.template({
                    name: user.name ?? to,
                    content
                })

                this.mailClient.send({
                    from: {
                        name: EMAIL_SENDER_NAME,
                        email: EMAIL_SENDER
                    },
                    to: [{ email: to }],
                    subject: subject,
                    html
                }).then(r => console.log(`Email ${r.message_ids} ${r.success ? "successfully" : "not"} sent`))
                    .catch(err => console.error(`Failed to send email to ${to}: ${err}`))
            })
            .catch(() => console.log("ERREUR ICI"))
    }
}