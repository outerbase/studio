interface BoardSqlErrorLogProps {
  value: string;
}

export default function BoardSqlErrorLog({ value }: BoardSqlErrorLogProps) {
  return (
    <div className="mt-2 mb-2 w-full p-2 font-mono text-red-500">{value}</div>
  );
}
