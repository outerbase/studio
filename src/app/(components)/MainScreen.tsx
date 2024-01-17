"use client";
import DatabaseDriver from "@/drivers/DatabaseDriver";
import { useMemo, useEffect, useState } from "react";
import DatabaseGui from "./DatabaseGui";
import { DatabaseDriverProvider } from "@/context/DatabaseDriverProvider";
import { ConnectionConfigScreen } from "./ConnectionConfigScreen";

function MainConnection({
  credential,
}: {
  credential: {
    url: string;
    token: string;
  };
}) {
  const database = useMemo(() => {
    return new DatabaseDriver(credential.url, credential.token);
  }, [credential]);

  useEffect(() => {
    return () => {
      database.close();
    };
  }, [database]);

  return (
    <DatabaseDriverProvider driver={database}>
      <DatabaseGui />
    </DatabaseDriverProvider>
  );
}

export default function MainScreen() {
  const [credential, setCredential] = useState<{
    url: string;
    token: string;
  } | null>(
    process.env.NEXT_PUBLIC_TESTING_DATABASE_URL
      ? {
          url: process.env.NEXT_PUBLIC_TESTING_DATABASE_URL as string,
          token: process.env.NEXT_PUBLIC_TESTING_DATABASE_TOKEN as string,
        }
      : null
  );

  return credential ? (
    <MainConnection credential={credential} />
  ) : (
    <div className="flex flex-wrap w-screen h-screen justify-center content-center">
      <ConnectionConfigScreen onConnect={setCredential} />
    </div>
  );
}
