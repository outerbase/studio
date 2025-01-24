import { WindowTabItemProps } from "@/components/gui/windows-tab";
import { scc } from "./command";
import { CommunicationChannel } from "./channel";

interface TabExtensionConfig<T> {
  name: string;
  key: (options: T) => string;
  generate: (options: T) => Omit<Omit<WindowTabItemProps, "key">, "identifier">;
}

interface TabExtensionCommand<T> {
  open: (options: T) => void;
  generate: (options: T) => WindowTabItemProps;
  replace: (options: T) => void;
  close: (options: T) => void;
}

export const tabOpenChannel = new CommunicationChannel<WindowTabItemProps>();
export const tabReplaceChannel = new CommunicationChannel<WindowTabItemProps>();
export const tabCloseChannel = new CommunicationChannel<string[]>();

export function createTabExtension<T>(
  config: TabExtensionConfig<T>
): TabExtensionCommand<T> {
  return Object.freeze({
    generate: (options: T) => {
      const key = [config.name, config.key(options)].filter(Boolean).join("-");
      return {
        ...config.generate(options),
        key,
        identifier: key,
        type: config.name,
      };
    },

    replace(options: T) {
      const key = [config.name, config.key(options)].filter(Boolean).join("-");

      tabReplaceChannel.send({
        ...config.generate(options),
        key,
        identifier: key,
        type: config.name,
      });
    },

    open(options: T) {
      const key = [config.name, config.key(options)].filter(Boolean).join("-");

      tabOpenChannel.send({
        ...config.generate(options),
        key,
        identifier: key,
        type: config.name,
      });
    },

    close(options: T) {
      const key = [config.name, config.key(options)].filter(Boolean).join("-");
      scc.tabs.close([key]);
    },
  });
}
