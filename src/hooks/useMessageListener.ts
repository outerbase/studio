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
      window.internalPubSub.addListener(channel, callback);
      return () => window.internalPubSub.removeListener(channel, callback);
    }
  }, [channel, callback]);
}
