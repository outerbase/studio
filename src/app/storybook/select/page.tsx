"use client";

import { Select } from "@/app/storybook/select/Select";
import Block from "@/app/storybook/storybook/Block";
import Inset from "@/app/storybook/storybook/Inset";
import Section from "@/app/storybook/storybook/Section";
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
