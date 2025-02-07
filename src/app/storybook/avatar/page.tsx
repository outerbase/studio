import { Avatar } from "@/app/storybook/avatar/Avatar";
import Block from "@/app/storybook/storybook/Block";
import Inset from "@/app/storybook/storybook/Inset";
import Section from "@/app/storybook/storybook/Section";

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
