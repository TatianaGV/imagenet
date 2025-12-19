import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { SearchItem } from '../api/types';
import { searchNodes } from '../api';
import { useDebouncedValue } from './useDebouncedValue';

type UseDebouncedSearchOptions = {
  delayMs?: number;
  minLength?: number;
};

type UseDebouncedSearchResult = {
  query: string;
  items: SearchItem[];
  loading: boolean;
  error: unknown | null;
  setQuery: (value: string) => void;
  reset: () => void;
};

export const useDebouncedSearch = (
  options: UseDebouncedSearchOptions = {},
): UseDebouncedSearchResult => {
  const { delayMs = 300, minLength = 1 } = options;

  const [query, setQueryState] = useState('');
  const trimmedQuery = useMemo(() => query.trim(), [query]);
  const debouncedQuery = useDebouncedValue(trimmedQuery, delayMs);

  const [items, setItems] = useState<SearchItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown | null>(null);

  const requestIdRef = useRef(0);

  const setQuery = useCallback((value: string) => {
    setQueryState(value);
  }, []);

  const reset = useCallback(() => {
    requestIdRef.current += 1;
    setQueryState('');
    setItems([]);
    setError(null);
    setLoading(false);
  }, []);

  useEffect(() => {
    const q = debouncedQuery;

    if (q.length < minLength) {
      requestIdRef.current += 1;
      setItems([]);
      setError(null);
      setLoading(false);
      return;
    }

    const requestId = ++requestIdRef.current;

    setLoading(true);
    setError(null);

    (async () => {
      try {
        const res = await searchNodes(q);

        if (requestId !== requestIdRef.current) return;

        setItems(res.items);
      } catch (e) {
        if (requestId !== requestIdRef.current) return;

        setItems([]);
        setError(e);
      } finally {
        if (requestId !== requestIdRef.current) return;

        setLoading(false);
      }
    })();
  }, [debouncedQuery, minLength]);

  return {
    query,
    items,
    loading,
    error,
    setQuery,
    reset,
  };
};
