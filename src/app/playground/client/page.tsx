"use client";
import MyStudio from "@/components/my-studio";
import SqljsDriver from "@/drivers/sqljs-driver";
import { useEffect, useState } from "react";

export default function PlaygroundEditor() {
  const [db, setDb] = useState<SqljsDriver>();

  useEffect(() => {
    console.log(window.initSqlJs);
    window
      .initSqlJs({
        locateFile: (file) => `/sqljs/${file}`,
      })
      .then((SQL) => {
        setDb(new SqljsDriver(new SQL.Database()));
      });
  }, []);

  return <>{db && <MyStudio color="gray" name="Playground" driver={db} />}</>;
}
