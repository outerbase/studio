"use client";
import { PropsWithChildren, useEffect, useState } from "react";

export default function ClientOnly(props: PropsWithChildren) {
  const [clientLoaded, setClientLoaded] = useState(false);

  useEffect(() => {
    setClientLoaded(typeof window !== "undefined");
  }, []);

  if (clientLoaded) {
    return props.children;
  }

  return null;
}
