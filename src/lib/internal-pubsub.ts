export default class InternalPubSub {
  protected listeners: Record<string, ((obj: any) => void)[]> = {};

  addListener<T = unknown>(channel: string, callback: (obj: T) => void) {
    if (this.listeners[channel]) {
      this.listeners[channel].push(callback);
    } else {
      this.listeners[channel] = [callback];
    }
  }

  removeListener<T = unknown>(channel: string, callback: (obj: T) => void) {
    if (this.listeners[channel]) {
      this.listeners[channel].filter((c) => c !== callback);
      if (this.listeners[channel].length) {
        delete this.listeners[channel];
      }
    }
  }

  send<T = unknown>(channel: string, obj: T) {
    const listeners = this.listeners[channel];
    if (listeners) {
      listeners.forEach((callback) => callback(obj));
    }
  }
}
