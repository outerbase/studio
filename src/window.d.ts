import { SavedDocDriver } from "./drivers/saved-doc/saved-doc-driver";

export {};

type OuterbaseIpc = {
  docs?: SavedDocDriver;
}; 
declare global {
  interface Window {
    outerbaseIpc?: OuterbaseIpc;
  }
}


