export interface RabbitmqListener {
    onMessage(msg: string): void
}

export interface RabbitmqRPCListener {
    onMessage(msg: string, reply: (response: object) => void): void
}