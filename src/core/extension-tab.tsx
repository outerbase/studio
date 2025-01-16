import { WindowTabItemProps } from "@/components/gui/windows-tab";
import { scc } from "./command";

interface TabExtensionConfig<T> {
  name: string;
  key: (options: T) => string;
  generate: (options: T) => Omit<Omit<WindowTabItemProps, "key">, "identifier">;
}

interface TabExtensionCommand<T> {
  open: (options: T) => void;
  generate: (options: T) => WindowTabItemProps;
  close: (options: T) => void;
}

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

    open(options: T) {
      if (window.outerbaseOpenTab) {
        const key = [config.name, config.key(options)]
          .filter(Boolean)
          .join("-");

        window.outerbaseOpenTab({
          ...config.generate(options),
          key,
          identifier: key,
          type: config.name,
        });
      }
    },

    close(options: T) {
      const key = [config.name, config.key(options)].filter(Boolean).join("-");
      scc.tabs.close([key]);
    },
  });
}
