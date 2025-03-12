import { generateId } from "@/lib/generate-id";
import {
  BaseDriver,
  DatabaseSchemas,
  DatabaseTableSchema,
} from "../base-driver";
import { AgentBaseDriver, AgentPromptOption } from "./base";

export interface ChatHistory {
  id: string;
  createdAt: number;
  messages: { role: string; content: string }[];
}

export interface CommonAgentMessage {
  role: string;
  content: string;
}

export default abstract class CommonAgentDriverImplementation extends AgentBaseDriver {
  protected history: Record<string, ChatHistory> = {};

  abstract query(messages: CommonAgentMessage[]): Promise<string>;

  getSystemContent(option: AgentPromptOption): string {
    if (option.selected) {
      return `You are an SQL expert. User is using ${this.driver.getFlags().dialect}. You are given a user selected query and you will improve it. Only return SQL code`;
    }

    return `You are an SQL expert. User is using ${this.driver.getFlags().dialect}.Only return SQL code`;
  }

  getSchemaContent(option: AgentPromptOption) {
    const parts = [];

    if (option.schema) {
      parts.push(
        "Here is " + this.driver.getFlags().dialect + " my database schema:\n\n"
      );

      parts.push(
        "```sql\n" + this.convertSchemaToDDLContent(option.schema) + "```"
      );
    }

    return parts.join("\n");
  }

  processResult(result: string): string {
    // Find the code block and extract it
    const codeBlock = result.match(/```sql\n([\s\S]*?)```/);
    if (codeBlock) {
      return codeBlock[1];
    }

    throw new Error("We cannot generate good response");
  }

  async run(
    message: string,
    previousId: string | undefined,
    option: AgentPromptOption
  ): Promise<string> {
    const session = this.history[previousId ?? ""] ?? {
      id: previousId || generateId(),
      createdAt: Date.now(),
      messages: [],
    };

    if (session.messages.length === 0) {
      session.messages.push({
        role: "system",
        content: this.getSystemContent(option),
      });

      session.messages.push({
        role: "user",
        content: this.getSchemaContent(option),
      });

      if (option.selected) {
        session.messages.push({
          role: "user",
          content:
            "This is my selected query ```sql\n" + option.selected + "```",
        });
      }
    }

    session.messages.push({
      role: "user",
      content: message,
    });

    const result = await this.query(session.messages);

    // Save the chat history
    session.messages.push({
      role: "assistant",
      content: result,
    });

    this.history[session.id] = session;
    return this.processResult(result);
  }

  constructor(protected driver: BaseDriver) {
    super();
  }

  protected convertTableToDDLContent(
    schemaName: string | undefined,
    table: DatabaseTableSchema
  ): string {
    const columns = table.columns
      .map((column) => {
        return `${this.driver.escapeId(column.name)} ${column.type}`;
      })
      .join(",\n");

    const fullTableName = schemaName
      ? `${this.driver.escapeId(schemaName)}.${this.driver.escapeId(table.tableName ?? "")}`
      : this.driver.escapeId(table.tableName ?? "");

    const primaryKeyPart =
      table.pk.length > 0
        ? `, PRIMARY KEY (${table.pk.map(this.driver.escapeId).join(", ")})`
        : "";

    const foreignKeyPart: string[] = [];
    for (const column of table.columns) {
      if (column.constraint?.foreignKey) {
        foreignKeyPart.push(
          [
            "FOREIGN KEY",
            column.name,
            "REFERENCES",
            column.constraint.foreignKey.foreignTableName ?? "",
            "(",
            (column.constraint?.foreignKey?.foreignColumns ?? [])[0] ?? "",
            ")",
          ].join(" ")
        );
      }
    }

    for (const constraint of table.constraints ?? []) {
      if (constraint.foreignKey) {
        foreignKeyPart.push(
          [
            "FOREIGN KEY",
            `(${(constraint.foreignKey.columns ?? []).join(", ")})`,
            "REFERENCES",
            constraint.foreignKey.foreignTableName ?? "",
            `(${(constraint.foreignKey.foreignColumns ?? []).join(", ")})`,
          ].join(" ")
        );
      }
    }

    return `CREATE TABLE ${fullTableName} (\n${columns}\n ${primaryKeyPart});`;
  }

  protected convertSchemaToDDLContent(schemas: DatabaseSchemas): string {
    const schemaParts: string[] = [];
    const defaultSchema = this.driver.getFlags().defaultSchema;

    for (const [schemaName, schema] of Object.entries(schemas)) {
      for (const table of schema) {
        if (!table.tableSchema) continue;
        if (!["table", "view"].includes(table.type)) continue;

        schemaParts.push(
          this.convertTableToDDLContent(
            defaultSchema.toLowerCase() === schemaName.toLowerCase()
              ? ""
              : schemaName,
            table.tableSchema
          )
        );
      }
    }

    return schemaParts.join("\n\n");
  }
}
