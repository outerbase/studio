import { OptimizeTableHeaderProps } from "@/components/gui/table-optimized";
import OptimizeTableState from "@/components/gui/table-optimized/OptimizeTableState";
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";

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
  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger inset>Format</DropdownMenuSubTrigger>
      <DropdownMenuSubContent>
        <DropdownMenuItem
          inset
          onClick={() => {
            state.updateHeaderDecorator(header, undefined);
          }}
        >
          None
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          inset
          onClick={() => {
            state.updateHeaderDecorator(header, currencyDecorator);
          }}
        >
          Currency
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          inset
          onClick={() => {
            state.updateHeaderDecorator(header, unixMsToDateTimeDecorator);
          }}
        >
          Unix Timestamp (ms) to datetime
        </DropdownMenuItem>
        <DropdownMenuItem
          inset
          onClick={() => {
            state.updateHeaderDecorator(header, unixToDateTimeDecorator);
          }}
        >
          Unix Timestamp (s) to datetime
        </DropdownMenuItem>
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  );
}
