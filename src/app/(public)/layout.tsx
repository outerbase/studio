import { Fragment } from "react";
import ThemeLayout from "../(theme)/theme_layout";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeLayout overrideTheme="dark">
      <Fragment>{children}</Fragment>
    </ThemeLayout>
  );
}
