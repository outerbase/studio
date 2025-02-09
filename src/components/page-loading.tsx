import { PropsWithChildren } from "react";
import ServerLoadingAnimation from "./icons/server-loading";

export default function PageLoading({ children }: PropsWithChildren) {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center gap-4">
      <ServerLoadingAnimation />
      {children}
    </div>
  );
}
