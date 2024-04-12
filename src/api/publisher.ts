type Subscriber<T> = (message: T) => void;

export class Publisher<T> {
    private channelMap: Record<string, Subscriber<T>[]> = {};

    subscribe(channelId: string, subscriber: Subscriber<T>) {
        if (!Array.isArray(this.channelMap[channelId])) {
            this.channelMap[channelId] = [];
        }

        this.channelMap[channelId].push(subscriber);
    }

    publish(channelId: string, message: T) {
        if (!Array.isArray(this.channelMap[channelId]) || this.channelMap[channelId].length < 1) {
            return;
        }

        this.channelMap[channelId].forEach((subscriber: Subscriber<T>) => subscriber(message));
    }
}
