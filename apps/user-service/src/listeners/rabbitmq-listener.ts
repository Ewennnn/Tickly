export interface RabbitmqListener {
    onMessage(msg: string): void
}