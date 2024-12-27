import { useDatabaseDriver } from "@/context/driver-provider";
import { DatabaseTriggerSchemaChange } from "@/drivers/base-driver";
import { produce } from "immer";
import { useCallback, useEffect, useMemo, useState } from "react";

export function useTriggerState(schemaName: string, name: string, tableName: string) {
  const { databaseDriver } = useDatabaseDriver();
  const initailTrigger = produce({
    name: {
      new: '',
      old: '',
    },
    operation: "INSERT",
    when: "BEFORE",
    tableName: '',
    whenExpression: "",
    statement: "",
    schemaName: '',
    isChange: false,
  }, draft => {
    draft.tableName = tableName;
    draft.schemaName = schemaName;
  })
  const [current, setCurrent] = useState(initailTrigger);
  const [trigger, setTrigger] = useState(initailTrigger);
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState<boolean>(true);

  const previewScript = useMemo(() => {
    return trigger ? databaseDriver.createUpdateTriggerSchema(trigger as DatabaseTriggerSchemaChange) : [''];
  }, [trigger, databaseDriver]);

  console.log(trigger)

  const getDefaultTrigger = useCallback(() => {
    if (name !== 'create') {
      databaseDriver
        .trigger(schemaName, name)
        .then(res => {
          const t = produce(initailTrigger, () => {
            return {
              ...res,
              name: {
                new: res.name || '',
                old: res.name || '',
              },
              schemaName,
              isChange: false
            }
          })
          setTrigger(t)
          setCurrent(t);
        })
        .catch((e: Error) => {
          setError(e.message);
        }).finally(() => {
          setLoading(false)
        });
    }
  }, [databaseDriver, name, schemaName, initailTrigger])

  useEffect(() => {
    if (loading) {
      getDefaultTrigger();
    }
  }, [getDefaultTrigger, loading]);

  const setTriggerField = (field: keyof typeof trigger, value: never | string | unknown) => {
    setTrigger(produce((draft: typeof trigger) => {
      draft[field] = value as never;
      draft.isChange = true;
    }))
  }

  const onDiscard = () => {
    setTrigger(
      produce(() => {
        return current
      })
    )
  }

  return {
    trigger,
    setTriggerField,
    error,
    onDiscard,
    previewScript
  }
}