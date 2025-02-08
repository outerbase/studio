"use client";

import Block from "@/components/orbit/block";
import Inset from "@/components/orbit/inset";
import { MenuBar, MenuBarItemProps } from "@/components/orbit/menu-bar";
import Section from "@/components/orbit/section";
import { useState } from "react";

const items: MenuBarItemProps[] = [
  {
    content: "All",
    value: "all",
  },
  {
    content: "Bases",
    value: "base",
  },
  {
    content: "Boards",
    value: "board",
  },
];

export default function MenuBarStorybook() {
  const [active, setActive] = useState("all");

  return (
    <Section>
      <Inset>
        <Block title="Menu bar">
          <MenuBar items={items} value={active} onChange={setActive} />
        </Block>
      </Inset>
    </Section>
  );
}
