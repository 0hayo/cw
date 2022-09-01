import useMounted from "./useMounted";
import { useState, useCallback } from "react";

const useFetch = <T extends any>(
  func: (...args: any[]) => any,
  init: T
): [(...args: any[]) => Promise<void>, T, boolean, any] => {
  const mounted = useMounted();
  const [error, setError] = useState<any>();
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<T>(init);
  const request = useCallback(
    async (...args: any[]) => {
      setLoading(true);
      try {
        const resp = await func(...args);
        if (mounted.current) {
          setLoading(false);
          setResponse(resp);
        }
      } catch (ex) {
        if (mounted.current) {
          setLoading(false);
          setError(ex);
        }
      }
    },
    // eslint-disable-next-line
    []
  );

  return [request, response, loading, error];
};

export default useFetch;
