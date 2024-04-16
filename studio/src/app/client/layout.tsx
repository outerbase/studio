import "@libsqlstudio/gui/css";
import { Fragment } from "react";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Fragment>{children}</Fragment>;
}
