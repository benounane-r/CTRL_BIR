import { useCallback, useEffect, useRef, useState } from 'react';

// loader() fonksiyonunu çalıştırır, istersek intervalMs'de bir tekrarlar.
// deps değişince yeniden yükler. { data, error, reload } döner.
export function usePolling(loader, deps = [], intervalMs = 0) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const loaderRef = useRef(loader);
  loaderRef.current = loader;

  const reload = useCallback(async () => {
    try {
      setData(await loaderRef.current());
      setError('');
    } catch (err) {
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        const result = await loaderRef.current();
        if (!cancelled) {
          setData(result);
          setError('');
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      }
    }

    run();
    if (!intervalMs) {
      return () => {
        cancelled = true;
      };
    }
    const timer = setInterval(run, intervalMs);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, intervalMs]);

  return { data, error, reload };
}
