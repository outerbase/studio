import SqlEditor from "@/components/gui/sql-editor";
import { Button } from "@/components/orbit/button";
import { Label } from "@/components/ui/label";
import { useTheme } from "next-themes";

function EditorTheme() {
  const statement = `CREATE TABLE video_game (
    game_id SERIAL PRIMARY KEY,
    title VARCHAR(222) NOT NULL,
    genre VARCHAR(222), plaform 
    VARCHAR(100), release_dat DATE,
    developer VARCHAR(255)
    );`;

  const EditorThemes = [
    {
      title: "Moondust",
    },
    {
      title: "Invasion",
    },
    {
      title: "Freedom",
    },
  ];
  return (
    <div className="mt-5">
      <h2 className="mb-3 text-base font-medium">Editor theme</h2>
      {EditorThemes.map((theme, index) => (
        <div key={index} className="mb-2 w-full">
          <Label>{theme.title}</Label>
          <div className="relative flex h-[200px] w-full items-center overflow-hidden rounded-2xl border bg-white p-2">
            <SqlEditor
              highlightVariable
              dialect="mysql"
              value={statement}
              readOnly
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function UserEditorTheme() {
  const { theme, setTheme } = useTheme();
  return (
    <div className="mt-6 flex flex-col items-start gap-2">
      <h2 className="text-xl font-medium text-balance text-neutral-800 dark:text-neutral-100">
        Theming
      </h2>
      <h2 className="mt-5 mb-3 text-base font-medium">Theme</h2>
      <div className="flex flex-row gap-5">
        <Button
          size="lg"
          title="System"
          toggled={theme === "system"}
          className="w-[110px] justify-center"
          onClick={() => setTheme("system")}
        />
        <Button
          size="lg"
          title="Dark"
          className="w-[110px] justify-center"
          toggled={theme === "dark"}
          onClick={() => setTheme("dark")}
        />
        <Button
          size="lg"
          title="Light"
          className="w-[110px] justify-center"
          toggled={theme === "light"}
          onClick={() => setTheme("light")}
        />
      </div>
      <EditorTheme />
    </div>
  );
}
