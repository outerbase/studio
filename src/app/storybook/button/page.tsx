"use client";

import { RefreshButton } from "@/app/storybook/button/refresh-button";
import Block from "@/components/orbit/block";
import { Button } from "@/components/orbit/button";
import Inset from "@/components/orbit/inset";
import Section from "@/components/orbit/section";
import { Database } from "@phosphor-icons/react";
import { useState } from "react";

export default function ButtonStorybook() {
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [toggled, setToggled] = useState(false);

  const handleToggle = () => {
    setToggled(!toggled);
  };

  const handleClickLoading = () => {
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
    }, 2000);
  };

  const handleClickRefresh = () => {
    setRefreshing(true);

    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };

  return (
    <Section>
      <Inset>
        <Block title="Button">
          <Button title={"Primary"} size="base" variant="primary" />
          <Button title={"Secondary"} />
          <Button title={"With icon"} loading={loading}>
            <Database />
          </Button>
          <Button
            title={"Small button"}
            size="sm"
            onClick={handleClickLoading}
            loading={loading}
          >
            <Database />
          </Button>
          <Button
            title={"Click to load"}
            size="lg"
            onClick={handleClickLoading}
            loading={loading}
          />
          <Button
            title={"Click to toggle"}
            size="base"
            variant="ghost"
            onClick={handleToggle}
            toggled={toggled}
          />
          <Button title={"Destructive"} size="base" variant="destructive" />
        </Block>
        <Block title="Refresh button">
          <RefreshButton
            onClick={handleClickRefresh}
            toggled={refreshing}
            size="base"
          />
        </Block>
      </Inset>
    </Section>
  );
}
