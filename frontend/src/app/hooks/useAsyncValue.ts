import { DependencyList, useEffect, useRef, useState } from "react";

type UseAsyncValueOptions<T> = {
  enabled?: boolean;
  onSuccess?: (value: T) => void;
  onError?: (error: Error) => void;
  initialValue?: T | null;
};

export function useAsyncValue<T>(
  load: () => Promise<T>,
  deps: DependencyList,
  options: UseAsyncValueOptions<T> = {}
) {
  const { enabled = true, onSuccess, onError, initialValue = null } = options;
  const [value, setValue] = useState<T | null>(initialValue);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState("");
  const requestIdRef = useRef(0);

  async function reload() {
    if (!enabled) {
      setLoading(false);
      return null;
    }

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    setLoading(true);
    setError("");

    try {
      const nextValue = await load();
      if (requestIdRef.current !== requestId) {
        return nextValue;
      }
      setValue(nextValue);
      onSuccess?.(nextValue);
      return nextValue;
    } catch (nextError) {
      if (requestIdRef.current !== requestId) {
        return null;
      }
      const resolvedError = nextError instanceof Error ? nextError : new Error("Request failed");
      setError(resolvedError.message);
      onError?.(resolvedError);
      return null;
    } finally {
      if (requestIdRef.current === requestId) {
        setLoading(false);
      }
    }
  }

  useEffect(() => {
    void reload();
  }, [enabled, ...deps]);

  return {
    value,
    setValue,
    loading,
    error,
    setError,
    reload
  };
}
