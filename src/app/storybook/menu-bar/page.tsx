"use client";

import { MenuBar } from "@/app/storybook/menu-bar/MenuBar";
import Block from "@/app/storybook/storybook/Block";
import Inset from "@/app/storybook/storybook/Inset";
import Section from "@/app/storybook/storybook/Section";
import { useState } from "react";

const items = [
  {
    content: "All",
    onClick: () => {
      console.log("Sort by All logic");
    },
    id: 0,
  },
  {
    content: "Bases",
    onClick: () => {
      console.log("Sort by Boards logic");
    },
    id: 1,
  },
  {
    content: "Boards",
    onClick: () => {
      console.log("Sort by Boards logic");
    },
    id: 2,
  },
];

export default function MenuBarStorybook() {
  const [active, setActive] = useState(0);

  const handleMenuClick = (id: number) => {
    setActive(id);
  };

  // Update list to handle ID click + its own onClick
  const updatedItems = items.map((item) => ({
    ...item,
    onClick: () => {
      handleMenuClick(item.id);
      item.onClick();
    },
  }));

  return (
    <Section>
      <Inset>
        <Block title="Menu bar">
          <MenuBar items={updatedItems} activeItem={active} />
        </Block>
      </Inset>
    </Section>
  );
}
