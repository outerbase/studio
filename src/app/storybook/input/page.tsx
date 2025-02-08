"use client";

import Block from "@/components/orbit/block";
import { Input } from "@/components/orbit/input";
import Inset from "@/components/orbit/inset";
import { Label } from "@/components/orbit/label";
import Section from "@/components/orbit/section";
import { useState } from "react";

export default function InputStorybook() {
  const [isValid, setIsValid] = useState(true);

  const checkIfValid = (value: string) => {
    if (value === "dog" || value === "") {
      setIsValid(true);
    } else setIsValid(false);
  };

  return (
    <Section>
      <Inset>
        <Block title="Input">
          <Label title="Name" htmlFor="name">
            <Input
              onValueChange={() => {}}
              placeholder="e.g. Joe Smith"
              id="name"
              size="sm"
              disabled
            />
          </Label>
          <Label
            title="Resource name"
            htmlFor="resourceName"
            required
            requiredDescription="text must be 'dog' "
            isValid={isValid}
          >
            <Input
              isValid={isValid}
              preText="outerbase.com/"
              onValueChange={checkIfValid}
              placeholder="my-cool-base"
              id="resourceName"
              size="base"
            />
          </Label>
          <Label title="Month" htmlFor="month">
            <Input
              onValueChange={() => {}}
              placeholder="e.g. April"
              id="month"
              size="lg"
            />
          </Label>
        </Block>
      </Inset>
    </Section>
  );
}
