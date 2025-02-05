export class BeforeQueryPipeline {
  metadata: Record<string, string> = {};

  constructor(
    protected type: "query" | "transaction" | "batch",
    protected statements: string[]
  ) {}

  getMetadata(name: string) {
    return this.metadata[name];
  }

  getMetadataList() {
    return structuredClone(this.metadata);
  }

  setMetadata(name: string, value: string) {
    this.metadata[name] = value;
  }

  getStatments() {
    return this.statements;
  }

  updateStatements(statements: string[]) {
    this.statements = statements;
  }

  getType() {
    return this.type;
  }
}
