import { buttonVariants } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useDatabaseDriver } from "@/context/DatabaseDriverProvider";
import { DatabaseSchemaItem } from "@/drivers/DatabaseDriver";
import { cn } from "@/lib/utils";
import { openTabs } from "@/messages/openTabs";
import { LucideIcon, Table2 } from "lucide-react";
import { useEffect, useState } from "react";

interface SchemaViewItemProps {
  icon: LucideIcon;
  title: string;
}

function SchemaViewmItem({ icon: Icon, title }: SchemaViewItemProps) {
  return (
    <div
      onDoubleClick={() => {
        openTabs({
          key: "table_" + title,
          name: title,
          type: "table",
          tableName: title,
        });
      }}
      className={cn(
        buttonVariants({ variant: "ghost", size: "sm" }),
        "justify-start",
        "cursor-pointer"
      )}
    >
      <Icon className="mr-2 h-4 w-4" />
      {title}
    </div>
  );
}

export default function SchemaView() {
  const [schemaItems, setSchemaItems] = useState<DatabaseSchemaItem[]>([]);
  const { databaseDriver } = useDatabaseDriver();

  useEffect(() => {
    databaseDriver.getTableList().then(setSchemaItems);
  }, [databaseDriver]);

  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col p-2 pr-4">
        {schemaItems.map((item) => {
          return (
            <SchemaViewmItem key={item.name} title={item.name} icon={Table2} />
          );
        })}
      </div>
    </ScrollArea>
  );
}
