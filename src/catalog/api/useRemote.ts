import { useCallback, useEffect, useState } from 'react';
import type { ApiError } from 'shell/apiClient';

export type Remote<T> =
  { state: 'loading' } | { state: 'error'; error: ApiError } | { state: 'data'; data: T };

/**
 * Loading, error and data of one request (Annex H, the four view states; "empty" is the page's
 * reading of the data). A new key cancels the request it replaces; `retry` asks again.
 */
export function useRemote<T>(load: (signal: AbortSignal) => Promise<T>, key: string) {
  const [remote, setRemote] = useState<Remote<T>>({ state: 'loading' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setRemote({ state: 'loading' });
    load(controller.signal).then(
      (data) => setRemote({ state: 'data', data }),
      (error: ApiError) => {
        if (!controller.signal.aborted) setRemote({ state: 'error', error });
      },
    );
    return () => controller.abort();
    // `load` is rebuilt on every render: the key (and a retry) decide when to ask again.
  }, [key, attempt]);

  const retry = useCallback(() => setAttempt((count) => count + 1), []);
  return { remote, retry };
}
