import type InternalPubSub from "../studio/src/lib/internal-pubsub";

export {};

declare global {
  interface Window {
    internalPubSub: InternalPubSub;
  }
}
