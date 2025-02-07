"use client";

import Block from "@/app/storybook/storybook/Block";
import Inset from "@/app/storybook/storybook/Inset";
import Section from "@/app/storybook/storybook/Section";
import { Toggle } from "@/app/storybook/toggle/Toggle";
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
          <Toggle onClick={handleToggleClick} toggled={toggle} size="sm" />
          <Toggle onClick={handleToggleClick} toggled={toggle} size="base" />
          <Toggle onClick={handleToggleClick} toggled={toggle} size="lg" />
        </Block>
      </Inset>
    </Section>
  );
}
