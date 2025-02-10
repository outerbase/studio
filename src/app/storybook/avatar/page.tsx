import { Avatar } from "@/components/orbit/avatar";
import Block from "@/components/orbit/block";
import Inset from "@/components/orbit/inset";
import Section from "@/components/orbit/section";

const userL = "logan";
const userLImg = "/logo.svg";

const userB = "brandon";

export default function AvatarStorybook() {
  return (
    <Section>
      <Inset>
        <Block title="Avatar">
          <Avatar username={userL} image={userLImg} size="base" />
          <Avatar username={userB} image={undefined} />
        </Block>
      </Inset>
    </Section>
  );
}
