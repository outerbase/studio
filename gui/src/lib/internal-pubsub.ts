export default class InternalPubSub {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected listeners: Record<string, Array<(obj: any) => void>> = {};

  addListener<T = unknown>(channel: string, callback: (obj: T) => void) {
    const c = this.listeners[channel];
    if (c) {
      c.push(callback);
    } else {
      this.listeners[channel] = [callback];
    }
  }

  removeListener<T = unknown>(channel: string, callback: (obj: T) => void) {
    const c = this.listeners[channel];
    if (c) {
      c.filter((c) => c !== callback);
      if (c.length) {
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
