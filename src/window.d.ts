import { SavedDocDriver } from "./drivers/saved-doc/saved-doc-driver";

export {};

type OuterbaseIpc = {
  docs?: SavedDocDriver;
  [key: string]: any;
}; 
declare global {
  interface Window {
    outerbaseIpc?: OuterbaseIpc;
  }
}


