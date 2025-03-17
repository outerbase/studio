import { OptimizeTableHeaderProps } from "@/components/gui/table-optimized";
import OptimizeTableState from "@/components/gui/table-optimized/optimize-table-state";
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { Check } from "@phosphor-icons/react";
import { useState } from "react";
import z from "zod";

function currencyDecorator(value: unknown) {
  if (typeof value === "number" || typeof value === "bigint") {
    return (
      <div className="w-full text-right">
        {new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(Number(value))}
      </div>
    );
  }

  return null;
}

function unixToDateTimeDecorator(value: unknown) {
  if (typeof value === "number" || typeof value === "bigint") {
    return (
      <div className="w-full text-right">
        {new Date(Number(value) * 1000).toISOString()}
      </div>
    );
  }

  return null;
}

function unixMsToDateTimeDecorator(value: unknown) {
  if (typeof value === "number" || typeof value === "bigint") {
    return (
      <div className="w-full text-right">
        {new Date(Number(value)).toISOString()}
      </div>
    );
  }

  return null;
}

export function DecoratorEditor({
  header,
  state,
}: {
  header: OptimizeTableHeaderProps;
  state: OptimizeTableState;
}) {
  const [type, setType] = useState(() => {
    const setting = header.store.get("decorator");

    const schema = z.object({ type: z.enum(["currency", "unix", "unix-ms"]) });
    const validated = schema.safeParse(setting);

    if (validated.error) {
      return null;
    }

    return validated.data.type;
  });

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger inset>Format</DropdownMenuSubTrigger>
      <DropdownMenuSubContent>
        <DropdownMenuItem
          inset={type !== null}
          onClick={() => {
            state.updateHeaderDecorator(header, undefined);
            setType(null);
            header.store.set("decorator", undefined);
          }}
        >
          {type === null ? <Check className="mr-2 h-4 w-4" /> : null}
          None
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          inset={type !== "currency"}
          onClick={() => {
            state.updateHeaderDecorator(header, currencyDecorator);
            setType("currency");
            header.store.set("decorator", { type: "currency" });
          }}
        >
          {type === "currency" ? <Check className="mr-2 h-4 w-4" /> : null}
          Currency
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          inset={type !== "unix-ms"}
          onClick={() => {
            state.updateHeaderDecorator(header, unixMsToDateTimeDecorator);
            setType("unix-ms");
            header.store.set("decorator", { type: "unix-ms" });
          }}
        >
          {type === "unix-ms" ? <Check className="mr-2 h-4 w-4" /> : null}
          Unix Timestamp (ms) to datetime
        </DropdownMenuItem>
        <DropdownMenuItem
          inset={type !== "unix"}
          onClick={() => {
            state.updateHeaderDecorator(header, unixToDateTimeDecorator);
            setType("unix");
            header.store.set("decorator", { type: "unix" });
          }}
        >
          {type === "unix" ? <Check className="mr-2 h-4 w-4" /> : null}
          Unix Timestamp (s) to datetime
        </DropdownMenuItem>
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  );
}
