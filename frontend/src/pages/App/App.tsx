import { Tree } from '../../components/Tree/Tree';
import { Search } from '../../components/Search/Search';
import { useLazyTree } from '../../hooks/useLazyTree';
import { useDebouncedSearch } from '../../hooks/useDebouncedSearch';

import styles from './App.module.scss';

export const App = () => {
  const {
    rootNodes,
    expanded,
    selectedId,
    childrenByParent,
    toggleNode,
    jumpTo,
  } = useLazyTree();

  const search = useDebouncedSearch({ delayMs: 300 });

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Finviz assignment</h1>

      <div className={styles.grid}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <b className={styles.cardTitle}>Tree</b>
          </div>

          {rootNodes.length !== 0 &&
            <Tree
              nodes={rootNodes}
              expanded={expanded}
              selectedId={selectedId}
              childrenByParent={childrenByParent}
              onToggle={toggleNode}
            />
          }
        </div>

        <div className={styles.rightCol}>
          <Search
            q={search.q}
            onChange={search.setQ}
            loading={search.loading}
            items={search.items}
            onPick={jumpTo}
          />
        </div>
      </div>
    </div>
  );
}
