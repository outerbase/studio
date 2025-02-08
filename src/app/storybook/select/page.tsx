"use client";

import Block from "@/components/orbit/block";
import Inset from "@/components/orbit/inset";
import Section from "@/components/orbit/section";
import { Select } from "@/components/orbit/select";
import { useState } from "react";

const dbs = [
  "SQLite",
  "MySQL",
  "Postgres",
  "LibSQL",
  "MongoDB",
  "Clickhouse",
  "BigQuery",
  "Snowflake",
  "MSSql",
  "Redshift",
];

export default function SelectStorybook() {
  const [value, setValue] = useState(dbs[0]);

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
