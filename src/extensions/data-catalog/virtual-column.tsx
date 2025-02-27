import { Button } from "@/components/orbit/button";
import { Toggle } from "@/components/orbit/toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Edit3, LucideMoreHorizontal, Trash } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { useDataCatalogContext } from "./data-model-tab";
import { DataCatalogTableRelationship } from "./driver";
import { virtualJoinDialog } from "./virtual-join-modal";

interface Props {
  data: DataCatalogTableRelationship;
}

export default function VirtualJoinColumn({ data }: Props) {
  const { driver } = useDataCatalogContext();
  const [isActive, setIsActive] = useState<boolean>(() => data.hide);

  const onDeletRelationship = useCallback(() => {
    driver
      .deleteVirtualColumn(data.id)
      .catch((error) => toast.error(error.message));
  }, [driver, data.id]);

  const handleClickToggle = useCallback(() => {
    const newActiveState = !isActive;

    setIsActive(newActiveState);
    const column = {
      hide: newActiveState,
      schemaName: data.schemaName,
      tableName: data.tableName,
      columnName: data.columnName,
      referenceTableName: data.referenceTableName,
      referenceColumnName: data.referenceColumnName,
    };
    if (data.id) {
      driver
        .updateVirtualJoin({ ...column, id: data.id })
        .then(() => {
          toast.success(
            `${data.columnName} is turned ${isActive ? "off" : "on"}`
          );
        })
        .catch((error) => {
          console.log(error);
        });
    } else {
      driver.addVirtualJoin(column).then(() => {
        toast.success(`${data.columnName} is turned on`);
      });
    }
  }, [driver, data, isActive]);

  return (
    <div
      className={cn(
        "border-accent flex items-center border-t pt-2 pb-2",
        isActive ? "opacity-100" : "opacity-50"
      )}
    >
      <Toggle size="sm" toggled={isActive} onChange={handleClickToggle} />

      <div className="flex w-[150px] items-center p-2 text-base">
        Virtual Relationship
      </div>
      <div className="flex w-[150px] items-center p-2 text-base">
        {data.referenceColumnName}
      </div>

      <div className="flex w-[150px] items-center p-2 text-base">
        {data.referenceTableName}
      </div>

      <div className="flex-1" />
      {
        //=================
        // Dropdown menu
        //=================
      }
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="base" variant="ghost">
            <LucideMoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="p-2">
          <DropdownMenuItem
            className="gap-5"
            onClick={() => {
              virtualJoinDialog
                .show({
                  driver,
                  relation: data,
                })
                .then()
                .catch();
            }}
          >
            Edit Relationship
            <div className="flex-1" />
            <Edit3 className="h-4 w-4" />
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="gap-5" onClick={onDeletRelationship}>
            Delete Virtual FK
            <div className="flex-1" />
            <Trash className="h-4 w-4" />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
