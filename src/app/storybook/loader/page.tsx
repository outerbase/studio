import Block from "@/components/orbit/block";
import Inset from "@/components/orbit/inset";
import { Loader } from "@/components/orbit/loader";
import Section from "@/components/orbit/section";

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
