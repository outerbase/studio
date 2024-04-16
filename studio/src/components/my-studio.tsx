import { BaseDriver, CollaborationDriver } from "@libsqlstudio/gui/driver";
import { Studio } from "@libsqlstudio/gui";
import { useTheme } from "@studio/context/theme-provider";
import { useRouter } from "next/navigation";
import { useCallback, useMemo } from "react";

interface MyStudioProps {
  name: string;
  color: string;
  driver: BaseDriver;
  collabarator?: CollaborationDriver;
}

export default function MyStudio({
  name,
  color,
  driver,
  collabarator,
}: MyStudioProps) {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  const goBack = useCallback(() => {
    router.push("/connect");
  }, [router]);

  const sideBanner = useMemo(() => {
    return (
      <div className="text-sm p-3 px-4">
        <strong>LibStudio Studio</strong> is open-source database GUI.
        <ul className="list-disc ml-6 mt-2">
          <li className="mb-1">
            <a
              className="text-blue-700 underline dark:text-blue-400"
              href={"https://github.com/invisal/libsql-studio/issues"}
              target="_blank"
              rel="noreferrer"
            >
              Request New Features
            </a>
          </li>
          <li>
            <a
              className="text-blue-700 underline dark:text-blue-400"
              href={"https://github.com/invisal/libsql-studio/issues"}
              target="_blank"
              rel="noreferrer"
            >
              Report Bugs
            </a>
          </li>
        </ul>
      </div>
    );
  }, []);

  return (
    <Studio
      driver={driver}
      name={name}
      color={color ?? "blue"}
      theme={theme}
      onThemeChange={toggleTheme}
      onBack={goBack}
      collaboration={collabarator}
      sideBarFooterComponent={sideBanner}
    />
  );
}
