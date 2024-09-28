import ThemeLayout from "../theme_layout";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ThemeLayout>{children}</ThemeLayout>;
}
