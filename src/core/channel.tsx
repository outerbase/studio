/**
 * Communication channel for sending and receiving data between components.
 */

type CommunicationChannelReceiver<T = unknown, P = void> = (data: T) => P;

export class CommunicationChannel<T = unknown, P = void> {
  private listeners: CommunicationChannelReceiver<T, P>[] = [];

  send(data: T): P | undefined {
    return this.listeners.map((listener) => listener(data)).pop();
  }

  listen(receiver: CommunicationChannelReceiver<T, P>) {
    this.listeners.push(receiver);
    return () => {
      this.listeners = this.listeners.filter(
        (listener) => listener !== receiver
      );
    };
  }
}
