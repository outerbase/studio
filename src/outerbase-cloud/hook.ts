import { useState } from "react";
import { OuterbaseAPIError } from "./api-type";

export default function useOuterbaseMutation<
  Arguments extends unknown[] = unknown[],
  ReturnType = unknown,
>(handler: (...arg: Arguments) => Promise<ReturnType>) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<OuterbaseAPIError>();

  const trigger = async (...args: Arguments) => {
    setLoading(true);
    try {
      return await handler(...args);
    } catch (e) {
      if (e instanceof OuterbaseAPIError) {
        setError(e);
      } else {
        throw e;
      }
    } finally {
      setLoading(false);
    }
  };

  return { loading, trigger, error };
}
