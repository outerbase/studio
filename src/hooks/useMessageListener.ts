import { useCallback, useEffect } from "react";

export default function useMessageListener<T = unknown>(
  channel: string,
  handleMessage: (obj?: T) => void,
  deps: unknown[] = []
) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const callback = useCallback(handleMessage, deps);

  useEffect(() => {
    if (window) {
      const listener = (e: MessageEvent<{ channel?: string; data?: T }>) => {
        if (e.data?.channel === channel) {
          callback(e.data.data);
        }
      };

      window.addEventListener("message", listener);
      return () => window.removeEventListener("message", listener);
    }
  }, [channel, callback]);
}
