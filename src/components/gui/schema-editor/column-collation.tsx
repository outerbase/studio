export default function ColumnCollation({
  value,
  onChange,
  disabled,
}: {
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <input
      value={value || ""}
      placeholder="Collation"
      disabled={disabled}
      list="collation-list"
      className="p-2 text-xs outline-hidden w-[150px] bg-inherit"
      spellCheck={false}
      onChange={(e) => onChange(e.currentTarget.value)}
    />
  );
}
