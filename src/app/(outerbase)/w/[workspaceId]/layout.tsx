import AuthProvider from "../../auth-provider";

export default function OuterbaseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthProvider>{children}</AuthProvider>;
}
