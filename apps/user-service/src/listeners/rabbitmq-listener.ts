export interface RabbitmqListener {
    onMessage(msg: string): void
}

export interface RabbitmqRCPListener {
    onMessage(msg: string, reply: (response: object) => void): void
}