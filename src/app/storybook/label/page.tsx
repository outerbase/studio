"use client";

import { Input } from "@/app/storybook/input/Input";
import { Label } from "@/app/storybook/label/Label";
import Block from "@/app/storybook/storybook/Block";
import Inset from "@/app/storybook/storybook/Inset";
import Section from "@/app/storybook/storybook/Section";

export default function LabelStorybook() {
  return (
    <Section>
      <Inset>
        <Block title="Label">
          <Label title="Name" htmlFor="name" className="w-1/2">
            <Input
              onValueChange={() => {}}
              placeholder="e.g. Joe Smith"
              id="name"
            />
          </Label>
        </Block>
      </Inset>
    </Section>
  );
}
