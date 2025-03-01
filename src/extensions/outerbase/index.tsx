/**
 * Outerbase Cloud extension for studio functionality.
 */
import { StudioExtension } from "@/core/extension-base";
import { StudioExtensionContext } from "@/core/extension-manager";
import { OuterbaseDatabaseConfig } from "@/outerbase-cloud/api-type";
import { updateOuterbaseSchemas } from "@/outerbase-cloud/api-workspace";

export default class OuterbaseExtension extends StudioExtension {
  extensionName = "outerbase-cloud-studio";

  constructor(protected config: OuterbaseDatabaseConfig) {
    super();
  }

  init(studio: StudioExtensionContext): void {
    // The Outerbase Data Catalog and AI-powered features
    // require the schema to be stored in the Outerbase API database.
    // Originally, Outerbase fetched the schema from an API endpoint
    // and stored it in its database.
    //
    // Our studio differs because we obtain the schema from
    // raw queries. The Outerbase API does not know when to refetch
    // the updated schema and store it in its database.
    // We hook into the event when the studio finishes fetching the schema
    // and notify Outerbase Cloud to refetch the schema on their side.
    //
    // TECHNICAL DEBT: This is redundant work and should be optimized in the future.
    studio.registerAfterFetchSchema(() => {
      updateOuterbaseSchemas(this.config.workspaceId, this.config.sourceId)
        .then()
        .catch();
    });
  }
}
