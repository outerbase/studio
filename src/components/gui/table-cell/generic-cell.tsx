import { useEffect, useMemo, useState } from "react";
import { isLinkString } from "@/lib/validation";
import DisplayLinkCell from "./display-link-cell";
import { cn } from "@/lib/utils";
import { OptimizeTableHeaderWithIndexProps } from "../table-optimized";
import { LucideArrowUpRight, LucideLoader } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DatabaseResultSet, DatabaseValue } from "@/drivers/base-driver";
import { useDatabaseDriver } from "@/context/driver-provider";
import { convertDatabaseValueToString } from "@/drivers/sqlite/sql-helper";

interface TableCellProps<T = unknown> {
  align?: "left" | "right";
  value: T;
  focus?: boolean;
  isChanged?: boolean;
  onFocus?: () => void;
  onDoubleClick?: () => void;
  header: OptimizeTableHeaderWithIndexProps;
}

interface SneakpeakProps {
  fkTableName: string;
  fkColumnName: string;
  value: DatabaseValue;
}

function SnippetRow({ fkTableName, fkColumnName, value }: SneakpeakProps) {
  const { databaseDriver } = useDatabaseDriver();
  const [data, setData] = useState<DatabaseResultSet>();

  useEffect(() => {
    databaseDriver
      .findFirst(fkTableName, { [fkColumnName]: value })
      .then(setData)
      .catch(console.error);
  }, [databaseDriver, fkTableName, fkColumnName, value]);

  if (!data) {
    return (
      <div className="p-4 text-sm">
        <LucideLoader className="animate-spin" />
        <p>Loading...</p>
      </div>
    );
  }

  if (data.rows.length === 0) {
    return <div>Data not found</div>;
  }

  return (
    <div className="flex flex-grow flex-col gap-3 p-4">
      {data.headers.map((header) => {
        const value = data.rows[0][header.name];
        let colorClassName = "";

        if (value === "" || value === null)
          colorClassName = "text-gray-400 dark:text-gray-600";
        if (typeof value === "string") colorClassName = "text-orange-500";
        if (typeof value === "bigint" || typeof value === "number")
          colorClassName = "text-blue-600 dark:text-blue-300";

        return (
          <div key={header.name}>
            <div className="font-mono text-xs text-gray-400 mb-1">
              {header.displayName}
            </div>
            <div
              className={cn(
                "font-mono text-sm overflow-hidden line-clamp-1 text-ellipsis w-[350px] whitespace-nowrap block",
                colorClassName
              )}
            >
              {convertDatabaseValueToString(value) || "EMPTY"}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ForeignKeyColumnSnippet(props: SneakpeakProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover onOpenChange={setOpen}>
      <PopoverTrigger>
        <LucideArrowUpRight className="w-4 h-4 text-gray-400 hover:text-blue-600" />
      </PopoverTrigger>
      <PopoverContent
        side="right"
        className="overflow-hidden p-0 m-0 w-[400px]"
      >
        <div className="flex w-full h-full flex-col overflow-hidden">
          <div className="px-4 py-2 border-b">
            <strong>{props.fkTableName}</strong>
          </div>
          <div className="grow max-h-[300px] overflow-y-auto overflow-x-hidden">
            {open && <SnippetRow {...props} />}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function BlobCellValue({
  value,
  vector,
}: {
  value: Uint8Array | ArrayBuffer | number[];
  vector?: boolean;
}) {
  if (vector) {
    const floatArray = [...new Float32Array(new Uint8Array(value).buffer)].join(
      ", "
    );

    return (
      <div className="flex">
        <div className="mr-2 justify-center items-center flex-col">
          <span className="bg-blue-500 text-white inline rounded p-1 pl-2 pr-2">
            vec
          </span>
        </div>
        <div className="text-orange-600">[{floatArray}]</div>
      </div>
    );
  } else {
    const sliceByte = value.slice(0, 64);
    const base64Text = btoa(
      new Uint8Array(sliceByte).reduce(
        (data, byte) => data + String.fromCharCode(byte),
        ""
      )
    );

    return (
      <div className="flex">
        <div className="mr-2 justify-center items-center flex-col">
          <span className="bg-blue-500 text-white inline rounded p-1 pl-2 pr-2">
            blob
          </span>
        </div>
        <div className="text-orange-600">{base64Text}</div>
      </div>
    );
  }
}

export default function GenericCell({
  value,
  onFocus,
  isChanged,
  focus,
  align,
  onDoubleClick,
  header,
}: TableCellProps) {
  const className = cn(
    "libsql-cell font-mono flex",
    focus ? "libsql-focus" : "",
    "pl-2 pr-2",
    isChanged ? "libsql-change" : ""
  );
  const isAlignRight = align === "right";

  const textBaseStyle = cn(
    "flex flex-grow text-gray-500",
    isAlignRight ? "justify-end" : ""
  );

  const fkContent = useMemo(() => {
    if (
      header.foreignKey?.foreignTableName &&
      header.foreignKey.foreignColumns
    ) {
      return (
        <div className="flex items-center shrink-0 cursor-pointer ml-2">
          <ForeignKeyColumnSnippet
            fkColumnName={header.foreignKey.foreignColumns[0] as string}
            fkTableName={header.foreignKey.foreignTableName}
            value={value}
          />
        </div>
      );
    }
    return null;
  }, [header, value]);

  const content = useMemo(() => {
    if (value === null) {
      return <span className={textBaseStyle}>NULL</span>;
    }

    if (value === undefined) {
      return <span className={textBaseStyle}>DEFAULT</span>;
    }

    if (typeof value === "string") {
      if (isLinkString(value)) {
        return <DisplayLinkCell link={value} />;
      }

      return (
        <span
          className={
            isChanged ? "text-black" : "text-gray-500 dark:text-gray-300"
          }
        >
          {value}
        </span>
      );
    }

    if (typeof value === "number" || typeof value === "bigint") {
      return (
        <span
          className={
            isChanged
              ? "text-black block text-right flex-grow"
              : "text-blue-700 dark:text-blue-300 block text-right flex-grow"
          }
        >
          {value.toString()}
        </span>
      );
    }

    if (
      value instanceof ArrayBuffer ||
      value instanceof Uint8Array ||
      Array.isArray(value)
    ) {
      return (
        <BlobCellValue
          value={value}
          vector={header.headerData?.type.includes("F32_BLOB")}
        />
      );
    }

    return <span>{value.toString()}</span>;
  }, [value, textBaseStyle, isChanged, header]);

  return (
    <div
      className={className}
      onMouseDown={onFocus}
      onDoubleClick={onDoubleClick}
    >
      <div className="flex flex-grow overflow-hidden">{content}</div>
      {fkContent}
    </div>
  );
}
