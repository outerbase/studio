
export interface BoardSource {
  id: string;
  name: string;
  type: string;
}

export abstract class BoardSourceDriver {
  abstract sourceList(): BoardSource[];
  abstract query(sourceId: string, statement: string): Promise<Record<string, unknown>[]>
  abstract cleanup(): void;
}