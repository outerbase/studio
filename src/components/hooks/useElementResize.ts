import { useEffect } from "react";

export default function useElementResize<T extends Element = Element>(
  callback: (element: T) => void,
  ref: React.RefObject<T>
) {
  useEffect(() => {
    if (ref.current) {
      callback(ref.current);
    }
  }, [ref, callback]);

  useEffect(() => {
    if (ref.current) {
      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          callback(entry.target as T);
        }
      });

      resizeObserver.observe(ref.current);
      return () => resizeObserver.disconnect();
    }
  }, [ref, callback]);
}
