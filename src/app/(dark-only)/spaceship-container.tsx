import { PropsWithChildren } from "react";

export function SpaceshipContentContainer({ children }: PropsWithChildren) {
  return (
    <div
      className="absolute left-[10%] z-2 flex w-[400px] flex-col gap-4 rounded-lg border border-neutral-800 bg-neutral-900 p-8 md:m-0"
      style={{
        top: "50%",
        transform: "translateY(-50%)",
      }}
    >
      {children}
    </div>
  );
}
