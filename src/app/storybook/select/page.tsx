"use client";

import Block from "@/components/orbit/block";
import Inset from "@/components/orbit/inset";
import Section from "@/components/orbit/section";
import { Select } from "@/components/orbit/select";
import { useState } from "react";

const dbs = [
  { value: "SQLite", label: "SQLite" },
  { value: "MySQL", label: "MySQL" },
  { value: "Postgres", label: "Postgres" },
  { value: "LibSQL", label: "LibSQL" },
  { value: "MongoDB", label: "MongoDB" },
  { value: "Clickhouse", label: "Clickhouse" },
  { value: "BigQuery", label: "BigQuery" },
];

export default function SelectStorybook() {
  const [value, setValue] = useState(dbs[0].value);

  return (
    <Section>
      <Inset>
        <Block title="Select">
          <Select
            options={dbs}
            setValue={(value) => setValue(value)}
            value={value}
            size="sm"
          />
          <Select
            options={dbs}
            setValue={(value) => setValue(value)}
            value={value}
            size="base"
          />
          <Select
            options={dbs}
            setValue={(value) => setValue(value)}
            value={value}
            size="lg"
          />
        </Block>
      </Inset>
    </Section>
  );
}
