"use client";
import JsonEditor from "@/components/gui/json-editor";
import ThemeProvider from "@/context/theme-provider";
import { useState } from "react";

export default function TestingPage() {
  const [code, setCode] = useState(
    JSON.stringify(
      {
        name: "Visal",
        country: {
          id: 1,
          verified: true,
          name: "Cambodia",
        },
      },
      undefined,
      2
    )
  );

  return (
    <ThemeProvider defaultTheme="dark">
      <JsonEditor value={code} onChange={setCode} />
    </ThemeProvider>
  );
}
