import { useEffect, useRef, useState } from 'react';
import type { SearchItem } from '../api/types';
import { searchNodes } from '../api';
import { useDebouncedValue } from './useDebouncedValue';

type UseDebouncedSearchOptions = {
  delayMs?: number;
  minLength?: number;
};

export const useDebouncedSearch = (options: UseDebouncedSearchOptions = {}) => {
  const { delayMs = 300, minLength = 1 } = options;

  const [q, setQ] = useState('');
  const debouncedQ = useDebouncedValue(q.trim(), delayMs);

  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<SearchItem[]>([]);

  const reqIdRef = useRef(0);

  useEffect(() => {
    const query = debouncedQ;

    if (!query || query.length < minLength) {
      setItems([]);
      setLoading(false);
      return;
    }

    let alive = true;
    const reqId = ++reqIdRef.current;

    setLoading(true);

    void (async () => {
      try {
        const res = await searchNodes(query);
        // only latest request wins
        if (!alive || reqId !== reqIdRef.current) return;
        setItems(res.items);
      } catch {
        if (!alive || reqId !== reqIdRef.current) return;
        setItems([]);
      } finally {
        if (!alive || reqId !== reqIdRef.current) return;
        setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [debouncedQ, minLength]);

  const reset = () => {
    setQ('');
    setItems([]);
    setLoading(false);
  };

  return { q, setQ, items, loading, reset };
}
