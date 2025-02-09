import { DialogProvider } from "@/components/create-dialog";
import AuthProvider from "../../auth-provider";

export default function OuterbaseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      {children}
      <DialogProvider slot="workspace" />
    </AuthProvider>
  );
}
