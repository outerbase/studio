import { useDatabaseDriver } from "@/context/DatabaseDriverProvider";
import {
  ReactGrid,
  Column,
  Row,
  CellChange,
  TextCell,
  Id,
  Cell,
} from "@silevis/reactgrid";
import * as hrana from "@libsql/hrana-client";
import { useEffect, useMemo, useRef, useState } from "react";

interface Person {
  name: string;
  surname: string;
  birth: Date | undefined;
  mobile: number;
  company: string;
  occupation: string;
}

const getPeople = (): Person[] => [
  {
    name: "Thomas",
    surname: "Goldman",
    birth: new Date("1970-12-02"),
    mobile: 574839457,
    company: "Snatia Ebereum",
    occupation: "CEO",
  },
  {
    name: "Mathew Lawrence",
    surname: "Joshua",
    birth: new Date("1943-12-02"),
    mobile: 684739283,
    company: "De-Jaiz Mens Clothing",
    occupation: "Technical recruiter",
  },
  {
    name: "Susie Evelyn",
    surname: "Spencer",
    birth: new Date("1976-01-23"),
    mobile: 684739283,
    company: "Harold Powell",
    occupation: "Concrete paving machine operator",
  },
  {
    name: "",
    surname: "",
    birth: undefined,
    mobile: NaN,
    company: "",
    occupation: "",
  },
];

const getColumns = (): Column[] => [
  { columnId: "Name", width: 150 },
  { columnId: "Surname", width: 100 },
  { columnId: "Birth Data", width: 100 },
  { columnId: "Phone", width: 100 },
  { columnId: "Company", width: 150 },
  { columnId: "Occupation", width: 230 },
];

const headerRow: Row = {
  rowId: "header",
  cells: [
    { type: "header", text: "Name" },
    { type: "header", text: "Surname" },
    { type: "header", text: "Birth Data" },
    { type: "header", text: "Phone" },
    { type: "header", text: "Company" },
    { type: "header", text: "Occupation" },
  ],
};

const getRows = (people: Person[]): Row[] => [
  headerRow,
  ...people.map<Row>((person, idx) => ({
    rowId: idx,
    cells: [
      { type: "text", text: person.name, style: { background: "white" } },
      { type: "text", text: person.surname, style: { background: "white" } },
      { type: "date", date: person.birth, style: { background: "white" } },
      { type: "number", value: person.mobile, style: { background: "white" } },
      { type: "text", text: person.company, style: { background: "white" } },
      {
        type: "text",
        style: { background: "white" },
        text: person.occupation,
        placeholder: "DEFAULT",
      },
    ],
  })),
];

const applyChangesToPeople = (
  changes: CellChange<TextCell>[],
  prevPeople: Person[]
): Person[] => {
  changes.forEach((change) => {
    const personIndex = change.rowId as number;
    const fieldName = change.columnId as string;
    (prevPeople as any)[personIndex][fieldName] = change.newCell.text;
  });
  return prevPeople;
};

interface TableDataContentProps {
  tableName: string;
}

export default function TableDataContent({ tableName }: TableDataContentProps) {
  const { databaseDriver } = useDatabaseDriver();
  const [data, setData] = useState<hrana.Row[]>([]);
  const [resultHeaders, setResultHeaders] = useState<
    { type: string; name: string; index: number }[]
  >([]);
  const [columns, setColumns] = useState<Column[]>([]);

  useEffect(() => {
    databaseDriver
      .selectFromTable(tableName, {
        limit: 50,
        offset: 0,
      })
      .then((r) => {
        setData(r.rows);
        setResultHeaders(
          r.columnNames.map((columnName, columnIndex) => {
            return {
              index: columnIndex,
              type: r.columnDecltypes[columnIndex] ?? "TEXT",
              name: columnName ?? "",
            };
          })
        );

        setColumns(
          r.columnNames.map((columnName) => {
            return {
              columnId: columnName ?? "",
              width: 150,
            };
          })
        );
      })
      .catch(console.error);
  }, [databaseDriver, tableName]);

  const rows = useMemo(() => {
    const headerRow = {
      rowId: "header",
      cells: resultHeaders.map((header) => ({
        type: "header",
        text: header.name,
      })),
    };

    const dataRows = data.map((row, rowIdx) => {
      return {
        rowId: rowIdx,
        cells: resultHeaders.map((header) => {
          if (header.type === "INTEGER") {
            return {
              type: "number",
              value: row[header.name] as number,
            };
          }

          return {
            type: "text",
            text: row[header.name] as string,
          };
        }),
      };
    });
    return [headerRow, ...dataRows];
  }, [data, resultHeaders]);

  return (
    <div className="p-4">
      <ReactGrid rows={rows} columns={columns} />
    </div>
  );
}
