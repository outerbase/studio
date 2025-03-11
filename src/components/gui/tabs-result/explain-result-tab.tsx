import { useStudioContext } from "@/context/driver-provider";
import { DatabaseResultSet } from "@/drivers/base-driver";
import { QueryExplanation } from "../query-explanation";

export default function ExplainResultTab({
  data,
}: {
  data: DatabaseResultSet;
}) {
  const { databaseDriver } = useStudioContext();
  return (
    <div className="flex h-full w-full flex-col border-t">
      <div className="grow overflow-hidden">
        <QueryExplanation
          data={data}
          dialect={databaseDriver.getFlags().dialect}
        />
      </div>
    </div>
  );
}
