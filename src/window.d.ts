import type InternalPubSub from "@/lib/internal-pubsub";

export {};

declare global {
  interface Window {
    internalPubSub: InternalPubSub;
    outerbaseIpc?: any;
  }
}
