import type { SearchItem } from '../../api/types';
import styles from './Search.module.scss';

type Props = {
  q: string;
  onChange: (v: string) => void;
  loading: boolean;
  items: SearchItem[];
  onPick: (path: string) => void | Promise<void>;
};

export const Search = ({ q, onChange, loading, items, onPick }: Props) => {
  const trimmed = q.trim();

  return (
    <div className={styles.panel}>
      <b>Search</b>

      <div className={styles.inputWrap}>
        <input
          className={styles.input}
          value={q}
          onChange={(e) => onChange(e.target.value)}
          placeholder="for example: phytoplankton"
        />
      </div>

      <div className={styles.meta}>
        {loading ? 'search...' : trimmed ? `${items.length} results` : ''}
      </div>

      {items.length > 0 && (
        <div className={styles.results}>
          {items.map((it) => (
            <button key={it.id} className={styles.itemBtn} onClick={() => void onPick(it.path)} title={it.path}>
              <div className={styles.itemName}>{it.name}</div>
              <div className={styles.itemPath}>{it.path}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
