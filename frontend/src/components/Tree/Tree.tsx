import { useCallback } from 'react';
import type { ApiNode } from '../../api/types';
import type { ChildrenCache } from '../../hooks/useLazyTree';
import styles from './Tree.module.scss';
import { TreeItem } from './components/TreeItem/TreeItem';

type TreeProps = {
  nodes: ApiNode[];
  level?: number;
  expanded: Set<string>;
  selectedId: string;
  childrenByParent: ChildrenCache;
  onToggle: (node: ApiNode) => void | Promise<void>;
};

export const Tree = ({
  nodes,
  level = 0,
  expanded,
  selectedId,
  childrenByParent,
  onToggle,
}: TreeProps) => {
  const handleToggle = useCallback(
    (node: ApiNode) => {
      void onToggle(node);
    },
    [onToggle],
  );

  if (!nodes.length) return null;

  return (
    <ul className={styles.list} role="tree">
      {nodes.map((node) => (
        <TreeItem
          key={node.id}
          node={node}
          level={level}
          expanded={expanded}
          selectedId={selectedId}
          childrenByParent={childrenByParent}
          onToggle={handleToggle}
        />
      ))}
    </ul>
  );
};
