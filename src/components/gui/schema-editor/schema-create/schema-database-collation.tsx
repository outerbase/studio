import { useDatabaseDriver } from "@/context/driver-provider";
import { Input } from "@/components/ui/input";

interface SchemaCollateSelectProps {
  value?: string;
  onChange: (value: string) => void;
  readonly?: boolean;
}

export function SchemaDatabaseCollation(
  {
    onChange,
    value,
  }: SchemaCollateSelectProps
) {
  const driver = useDatabaseDriver();

  return (
    <>
      <Input
        value={value || ""}
        placeholder="Collation"
        list="collation-list"
        className="p-2 text-xs outline-none w-[150px] bg-inherit"
        spellCheck={false}
        onChange={(e) => onChange(e.currentTarget.value)}
      />
      {driver.databaseDriver.getCollationList().length > 0 && (
        <datalist id="collation-list" className="hidden">
          {driver.databaseDriver.getCollationList().map((collation) => (
            <option key={collation} value={collation} />
          ))}
        </datalist>
      )}
    </>
  )
}