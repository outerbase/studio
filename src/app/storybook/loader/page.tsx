import { Loader } from "@/app/storybook/loader/Loader";
import Block from "@/app/storybook/storybook/Block";
import Inset from "@/app/storybook/storybook/Inset";
import Section from "@/app/storybook/storybook/Section";

export default function LoaderStorybook() {
  return (
    <Section>
      <Inset>
        <Block title="Loader">
          <Loader size={40} />
        </Block>
      </Inset>
    </Section>
  );
}
