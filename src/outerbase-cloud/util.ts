import { DataCatalogSchemas } from "@/extensions/data-catalog/driver";
import {
  OuterbaseDataCatalogComment,
  OuterbaseDataCatalogSchemas,
} from "./api-type";

export function transformOuterbaseSchema(
  data: Record<string, OuterbaseDataCatalogSchemas[]>,
  comments: OuterbaseDataCatalogComment[]
): DataCatalogSchemas {
  return Object.keys(data).reduce<DataCatalogSchemas>((acc, key) => {
    data[key].forEach((schema) => {
      if (!acc[schema.schema]) {
        acc[schema.schema] = {};
      }

      const tableMetadata = comments.find(
        (c) =>
          c.schema === schema.schema &&
          c.table === schema.name &&
          !c.column &&
          !c.flags.isVirtualKey
      );

      acc[schema.schema][schema.name] = {
        schemaName: schema.schema,
        tableName: schema.name,

        columns: schema.columns.reduce(
          (columnsAcc, col) => {
            const comment = comments.find(
              (c) =>
                c.schema === schema.schema &&
                c.table === schema.name &&
                c.column === col.name &&
                !c.flags.isVirtualKey
            );

            if (comment) {
              columnsAcc[col.name] = comment;
            }

            return columnsAcc;
          },
          {} as Record<string, OuterbaseDataCatalogComment>
        ),

        virtualJoin: comments.filter(
          (c) =>
            c.schema === schema.schema &&
            c.table === schema.name &&
            c.virtualKeyColumn &&
            c.flags.isVirtualKey
        ),
        metadata: tableMetadata,
      };
    });

    return acc;
  }, {});
}
