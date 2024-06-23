import { DatabaseColumnConflict } from "@/drivers/base-driver";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";

export default function ConflictClauseOptions({
  value,
  onChange,
  disabled,
}: Readonly<{
  value?: DatabaseColumnConflict;
  onChange?: (v: DatabaseColumnConflict) => void;
  disabled?: boolean;
}>) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="bg-background" disabled={disabled}>
        <SelectValue placeholder="Conflict" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="ROLLBACK">Rollback</SelectItem>
        <SelectItem value="ABORT">Abort</SelectItem>
        <SelectItem value="FAIL">Fail</SelectItem>
        <SelectItem value="IGNORE">Ignore</SelectItem>
        <SelectItem value="REPLACE">Replace</SelectItem>
      </SelectContent>
    </Select>
  );
}
