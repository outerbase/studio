import { Edit3 } from "lucide-react";
import { DataCatalogTermDefinition } from "./driver";

interface Props {
  onSelect: (item: DataCatalogTermDefinition) => void;
  data: DataCatalogTermDefinition[];
}
export default function TermDefinitionList({ data, onSelect }: Props) {
  return (
    <div className="mt-10">
      {data?.map((item) => {
        return (
          <div
            onClick={() => onSelect(item)}
            key={item.id}
            className="bg-accent mt-3 flex rounded-xl border p-5 hover:bg-gray-200 dark:bg-neutral-900 dark:hover:bg-neutral-800"
          >
            <div className="gap-5">
              <div className="text-lg font-bold">{item.name}</div>
              <div>{item.definition}</div>
              {item.otherNames && (
                <div className="mt-3 text-sm">
                  Also known as: {item.otherNames}
                </div>
              )}
            </div>
            <div className="flex-1" />
            <Edit3 size={18} />
          </div>
        );
      })}
    </div>
  );
}
