import {
  BaseDriver,
  DatabaseSchemas,
  DatabaseTableSchema,
} from "../base-driver";
import {
  AgentBaseDriver,
  AgentPromptOption,
  AgentPromptResponse,
} from "./base";

interface ChatHistory {
  id: string;
  createdAt: number;
  messages: { role: string; content: string }[];
}

interface ChatGPTResponse {
  choices: { message: { role: string; content: string } }[];
}

export class ChatGPTDriver implements AgentBaseDriver {
  protected history: Record<string, ChatHistory> = {};

  constructor(
    protected driver: BaseDriver,
    protected token: string
  ) {}

  protected convertTableToContent(
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

  protected convertSchemaToContent(schemas: DatabaseSchemas): string {
    const schemaParts: string[] = [];
    const defaultSchema = this.driver.getFlags().defaultSchema;

    for (const [schemaName, schema] of Object.entries(schemas)) {
      for (const table of schema) {
        if (!table.tableSchema) continue;
        if (!["table", "view"].includes(table.type)) continue;

        schemaParts.push(
          this.convertTableToContent(
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

  async promptInline(
    message: string,
    previousId: string | undefined,
    option: AgentPromptOption
  ): Promise<AgentPromptResponse> {
    const session = this.history[previousId ?? ""] ?? {
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      messages: [],
    };

    if (session.messages.length === 0) {
      session.messages.push({
        role: "system",
        content: "You are an SQL expert. Only return SQL code.",
      });

      session.messages.push({
        role: "user",
        content:
          "Here is " +
          this.driver.getFlags().dialect +
          " my database schema:\n\n",
      });

      if (option.schema) {
        session.messages.push({
          role: "user",
          content:
            "```sql\n" + this.convertSchemaToContent(option.schema) + "```",
        });
      }

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

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini-2024-07-18",
        temperature: 0,
        messages: session.messages,
      }),
    });

    const jsonResponse = (await response.json()) as ChatGPTResponse;
    const suggestedQuery = jsonResponse.choices[0].message.content;

    // Striped the SQL code from the response
    const sqlCode = suggestedQuery.replace(/```sql\n/g, "").replace(/```/g, "");

    // Save the chat history
    session.messages.push({
      role: "assistant",
      content: suggestedQuery,
    });

    this.history[session.id] = session;

    return {
      id: session.id,
      result: sqlCode,
    };
  }
}
