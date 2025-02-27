"use client";

import Block from "@/components/orbit/block";
import Inset from "@/components/orbit/inset";
import Section from "@/components/orbit/section";
import { Toggle } from "@/components/orbit/toggle";
import { useState } from "react";

export default function ToggleStorybook() {
  const [toggle, setToggle] = useState(false);

  const handleToggleClick = () => {
    setToggle(!toggle);
  };

  return (
    <Section>
      <Inset>
        <Block title="Toggle">
          <Toggle onChange={handleToggleClick} toggled={toggle} size="sm" />
          <Toggle onChange={handleToggleClick} toggled={toggle} size="base" />
          <Toggle onChange={handleToggleClick} toggled={toggle} size="lg" />
        </Block>
      </Inset>
    </Section>
  );
}
