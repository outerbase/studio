import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ColumnTypeSuggestionGroup } from "@/drivers/base-driver";
import { useMemo, useState } from "react";

function ColumnTypeList({
  items,
  onChange,
}: {
  items: ColumnTypeSuggestionGroup[];
  onChange: (text: string) => void;
}) {
  return items.map((group) => (
    <div key={group.name}>
      <div className="text-sm font-bold py-1 px-4 bg-accent mb-1">
        {group.name}
      </div>
      <div className="flex flex-col">
        {group.suggestions.map((type) => {
          const itemClassName =
            "py-0.5 px-3 pl-8 cursor-pointer hover:bg-muted";

          const parameters = type.parameters ?? [];
          let content = <span>{type.name.toUpperCase()}</span>;

          if (parameters.length > 0) {
            content = (
              <>
                {type.name.toUpperCase()}
                <strong className="ml-0.5">(</strong>
                <span className="text-muted-foreground">
                  {parameters.map((p) => p.name).join(", ")}
                </span>
                <strong>)</strong>
              </>
            );
          }

          return (
            <div
              key={type.name}
              className={itemClassName}
              onPointerDown={(e) => {
                e.preventDefault();
              }}
              onClick={() => {
                if (parameters.length > 0) {
                  onChange(
                    `${type.name.toUpperCase()}(${parameters.map((p) => p.default).join(",")})`
                  );
                } else {
                  onChange(`${type.name.toUpperCase()}`);
                }
              }}
            >
              {content}
            </div>
          );
        })}
      </div>
    </div>
  ));
}

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
          suggestions: group.suggestions
            .filter((type) => {
              return (
                type.name.toLowerCase().startsWith(parsedType.toLowerCase()) &&
                type.name !== "uuid"
              );
            })
            .map((x) => {
              if (["enum", "set"].includes(x.name)) {
                return {
                  ...x,
                  parameters: [{ name: "", default: "'Y','N'" }],
                };
              }
              return x;
            }),
        };
      }
    })
    .filter((group) => group.suggestions.length > 0);

  let suggestionDom = (
    <ColumnTypeList items={filteredSuggestions} onChange={onChange} />
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
      <div className="p-4">
        <div className="text-lg font-semibold">
          {typeSuggestion.name.toUpperCase()}
          {typeSuggestion.parameters &&
            typeSuggestion.parameters.length > 0 && (
              <>
                <strong>(</strong>
                <span className="text-muted-foreground">
                  {typeSuggestion?.parameters.map((p) => p.name).join(", ")}
                </span>
                <strong>)</strong>
              </>
            )}
        </div>

        {typeof typeSuggestion.description === "string" && (
          <div className="text-sm my-1 font-sans">
            {typeSuggestion.description}
          </div>
        )}
        {typeof typeSuggestion.description === "function" && (
          <div
            className="text-sm my-1 font-sans"
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
        className="p-2 text-sm outline-hidden w-[150px] bg-inherit"
        onFocus={() => setShowSuggestion(true)}
        onBlur={() => {
          setShowSuggestion(false);
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
            className="w-[300px] max-h-[300px] p-0 overflow-y-auto mt-2 font-mono"
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            {suggestionDom}
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
