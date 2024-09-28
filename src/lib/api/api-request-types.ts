export interface RequestOperationBatch {
  type: "batch";
  statements: string[];
}

export interface RequestOperationQuery {
  type: "query";
  statement: string;
}

export type RequestOperationBody =
  | RequestOperationBatch
  | RequestOperationQuery;
