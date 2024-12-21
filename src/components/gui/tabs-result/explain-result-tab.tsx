import { useDatabaseDriver } from "@/context/driver-provider";
import { QueryExplanation } from "../query-explanation";
import { DatabaseResultSet } from "@/drivers/base-driver";

export default function ExplainResultTab({
  data,
}: {
  data: DatabaseResultSet;
}) {
  const { databaseDriver } = useDatabaseDriver();

  return (
    <div className="flex flex-col h-full w-full border-t">
      <div className="grow overflow-hidden">
        <QueryExplanation
          data={data}
          dialect={databaseDriver.getFlags().dialect}
        />
      </div>
    </div>
  );
}
