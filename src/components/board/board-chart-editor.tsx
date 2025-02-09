import { produce } from "immer";
import { useState } from "react";
import { ChartValue } from "../chart/chart-type";
import EditChartMenu from "../chart/edit-chart-menu";
import SqlEditor from "../gui/sql-editor";
import BoardSourcePicker from "./board-source-picker";

export default function BoardChartEditor() {
  const [value, setValue] = useState<ChartValue>({
    model: "chart",
    type: "line",
    connection_id: "",
    created_at: "",
    id: "",
    source_id: "",
    updated_at: "",
    workspace_id: "",
    name: "",
    params: {
      type: "line",
      id: "",
      name: "",
      model: "chart",
      apiKey: "",
      layers: [
        {
          type: "sql",
          sql: "",
        },
      ],
      options: {
        yAxisKeys: [],
        xAxisKey: "",
      },
      source_id: "",
      created_at: "",
      updated_at: "",
      workspace_id: "",
      connection_id: "",
    },
  });

  return (
    <div className="flex flex-1 border-t">
      <div className="flex flex-1 flex-col">
        <div className="h-1/2 border-b p-4">
          <div className="text-lg font-semibold">Chart Editor</div>
        </div>
        <div className="h-1/2 overflow-x-hidden">
          <div className="border-b px-4 py-2">
            <BoardSourcePicker />
          </div>
          <div>
            <SqlEditor
              dialect="sqlite"
              value={value.params.layers[0].sql}
              onChange={(e) => {
                setValue(
                  produce(value, (draft) => {
                    draft.params.layers[0].sql = e;
                  })
                );
              }}
            />
          </div>
        </div>
      </div>
      <div className="w-[370px] overflow-x-hidden overflow-y-auto border-l p-4">
        <EditChartMenu value={value} onChange={setValue} columns={[]} />
      </div>
    </div>
  );
}
