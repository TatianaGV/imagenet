import { useCallback, useMemo } from 'react';
import type { SearchItem } from '../../api/types';

import styles from './Search.module.scss';

type Props = {
  query: string;
  loading: boolean;
  items: SearchItem[];
  onPick: (path: string) => void | Promise<void>;
  onChange: (value: string) => void;
};

export const Search = ({ query, loading, items, onPick, onChange }: Props) => {
  const trimmedQuery = useMemo(() => query.trim(), [query]);

  const metaText = useMemo(() => {
    if (loading) return 'search...';
    if (!trimmedQuery) return '';
    return `${items.length} results`;
  }, [loading, trimmedQuery, items.length]);

  const showResults = trimmedQuery.length > 0 && items.length > 0;

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onChange(event.target.value);
    },
    [onChange],
  );

  const handlePick = useCallback(
    async (path: string) => {
      try {
        await onPick(path);
      } catch (error) {
        console.error('[Search] onPick failed:', error);
      }
    },
    [onPick],
  );

  return (
    <section className={styles.panel} aria-label="Search panel">
      <b>Search (3 characters or more)</b>

      <div className={styles.inputWrap}>
        <input
          className={styles.input}
          value={query}
          onChange={handleInputChange}
          placeholder="for example: cycling"
          aria-label="Search query"
          aria-busy={loading}
          autoComplete="off"
          spellCheck={false}
        />
      </div>

      <div className={styles.meta} aria-live="polite">
        {metaText}
      </div>

      {showResults && (
        <div className={styles.results} role="list">
          {items.map(({ id, name, path }) => (
            <button
              key={id}
              type="button"
              className={styles.itemBtn}
              onClick={() => void handlePick(path)}
              title={path}
              role="listitem"
            >
              <div className={styles.itemName}>{name}</div>
              <div className={styles.itemPath}>{path}</div>
            </button>
          ))}
        </div>
      )}
    </section>
  );
};
