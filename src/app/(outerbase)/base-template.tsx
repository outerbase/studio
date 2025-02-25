import {
  CommonConnectionConfig,
  CommonConnectionConfigTemplate,
} from "@/components/connection-config-editor";
import { OuterbaseAPISourceInput } from "@/outerbase-cloud/api-type";
import { ReactElement } from "react";
import { SavedConnectionRawLocalStorage } from "../(theme)/connect/saved-connection-storage";

export interface ConnectionTemplateList {
  template: CommonConnectionConfigTemplate;
  localFrom?: (value: SavedConnectionRawLocalStorage) => CommonConnectionConfig;
  localTo?: (value: CommonConnectionConfig) => SavedConnectionRawLocalStorage;

  /**
   * Convert the remote source config to common connecting config
   * @param value
   * @returns
   */
  remoteFrom?: (value: {
    source: OuterbaseAPISourceInput;
    name: string;
  }) => CommonConnectionConfig;

  /**
   * Convert the common connecting config to remote source config
   * @param value
   * @returns
   */
  remoteTo?: (value: CommonConnectionConfig) => {
    source: OuterbaseAPISourceInput;
    name: string;
  };
  instruction?: ReactElement;
}
