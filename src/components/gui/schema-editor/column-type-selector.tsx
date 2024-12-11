import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ColumnTypeSuggestionGroup } from "@/drivers/base-driver";
import { useMemo, useState } from "react";

export default function ColumnTypeSelector({
  value,
  onChange,
  suggestions,
}: {
  value: string;
  onChange: (type: string) => void;
  disabled?: boolean;
  suggestions: ColumnTypeSuggestionGroup[];
}) {
  const [showSuggestion, setShowSuggestion] = useState(false);

  // Parse the value into type and parameters
  const { parsedType, parsedParameters } = useMemo(() => {
    const match = value.match(/([a-zA-Z]+)(\((.*)\))?/);

    if (!match) {
      return {
        parsedType: "",
      };
    }

    const type = match[1];
    const parameters = match[3]?.split(",").map((p) => p.trim());

    return { parsedType: type ?? "", parsedParameters: parameters };
  }, [value]);

  const filteredSuggestions = suggestions
    .map((group) => {
      {
        return {
          ...group,
          suggestions: group.suggestions.filter((type) => {
            return type.name.toLowerCase().startsWith(parsedType.toLowerCase());
          }),
        };
      }
    })
    .filter((group) => group.suggestions.length > 0);

  let suggestionDom = (
    <>
      {filteredSuggestions.map((group) => (
        <div key={group.name}>
          <div className="text-sm font-bold">{group.name}</div>
          <div
            className="flex flex-col py-1"
            onClick={() => {
              console.log("item clicked");
            }}
          >
            {group.suggestions.map((type) => {
              const itemClassName =
                "p-0.5 pl-4 cursor-pointer hover:bg-gray-100";

              if (type.parameters && type.parameters.length > 0) {
                return (
                  <div key={type.name} className={itemClassName}>
                    {type.name}
                    <strong> (</strong>{" "}
                    <span className="text-muted-foreground">
                      {type.parameters.map((p) => p.name).join(", ")}
                    </span>{" "}
                    <strong>)</strong>
                  </div>
                );
              }

              return (
                <div key={type.name} className={itemClassName}>
                  {type.name}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </>
  );

  // If there is only one suggestion left
  if (
    filteredSuggestions.length === 1 &&
    filteredSuggestions[0].suggestions.length === 1 &&
    filteredSuggestions[0].suggestions[0].name.toLowerCase() ===
      parsedType.toLowerCase()
  ) {
    const typeSuggestion = filteredSuggestions[0].suggestions[0];

    suggestionDom = (
      <div>
        <div className="text-lg font-semibold">
          {typeSuggestion.name}
          {typeSuggestion.parameters &&
            typeSuggestion.parameters.length > 0 && (
              <>
                <strong> (</strong>{" "}
                <span className="text-muted-foreground">
                  {typeSuggestion?.parameters.map((p) => p.name).join(", ")}
                </span>{" "}
                <strong>)</strong>
              </>
            )}
        </div>

        {typeof typeSuggestion.description === "string" && (
          <div className="text-sm my-1">{typeSuggestion.description}</div>
        )}
        {typeof typeSuggestion.description === "function" && (
          <div
            className="text-sm my-1"
            dangerouslySetInnerHTML={{
              __html: typeSuggestion.description(parsedType, parsedParameters),
            }}
          />
        )}

        {typeSuggestion.parameters && (
          <ul className="flex flex-col gap-1 my-2 text-sm">
            {typeSuggestion.parameters.map((p) => (
              <li key={p.name}>
                <strong className="font-semibold">{p.name}</strong>
                <p className="text-muted-foreground">{p.description}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <input
        className="p-2 text-sm outline-none w-[150px] bg-inherit"
        onFocus={() => setShowSuggestion(true)}
        onBlur={() => {
          setShowSuggestion(false);
          console.log("blur");
        }}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
        }}
      />
      {showSuggestion && (
        <Popover open={showSuggestion} modal={false}>
          <PopoverTrigger />
          <PopoverContent
            className="w-[300px] max-h-[300px] p-0 overflow-y-auto p-2 mt-2"
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            {suggestionDom}
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
