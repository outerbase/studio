"use client";
import SqlEditor from "@/components/gui/sql-editor";
import { useState } from "react";

export default function StorybookEditorPage() {
  const [value, setValue] = useState(`CREATE TABLE customer(
  cust_id INTEGER PRIMARY KEY,
  cust_name TEXT,
  cust_addr TEXT
);

-- some comment here that should be ignore


CREATE VIEW customer_address AS
   SELECT cust_id, cust_addr FROM customer;
CREATE TRIGGER cust_addr_chng
INSTEAD OF UPDATE OF cust_addr ON customer_address
BEGIN
  UPDATE customer SET cust_addr=NEW.cust_addr
   WHERE cust_id=NEW.cust_id;
END;
`);

  return (
    <div>
      <SqlEditor
        dialect="sqlite"
        value={value}
        onChange={setValue}
        onPrompt={async (prompt, selected) => {
          const selectedText = selected?.text;

          // do some fake delay
          await new Promise((resolve) => setTimeout(resolve, 1000));

          // random error
          if (Math.random() < 0.2) {
            throw new Error("Random error");
          }

          const lines = selectedText?.split("\n") || [];

          for (let i = 0; i < lines.length; i++) {
            if (Math.random() > 0.5) {
              lines.splice(i, 0, "some random text " + Math.random());
              i++;
            }
          }

          for (let i = 0; i < 5; i++) {
            // add random lines at the end
            if (Math.random() > 0.5) {
              lines.push("some random text " + Math.random());
            }
          }

          // randomly remove lines
          const finalLines = lines.filter(() => Math.random() > 0.35);
          console.log(finalLines);

          return finalLines.join("\n");
        }}
      />
    </div>
  );
}
