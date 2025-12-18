import type { ApiNode } from '../../api/types';
import type { ChildrenCache } from '../../hooks/useLazyTree';
import { TreeNode } from './components/TreeNode/TreeNode';
import styles from './Tree.module.scss';

type Props = {
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
}: Props) => {
  return (
    <ul className={styles.list}>
      {nodes.map((node) => {
        const isExpanded = expanded.has(node.id);
        const isSelected = selectedId === node.id;
        const children = childrenByParent.get(node.id) ?? [];

        return (
          <li key={node.id}>
            <TreeNode
              node={node}
              level={level}
              isExpanded={isExpanded}
              isSelected={isSelected}
              onToggle={onToggle}
            />

            {isExpanded && children.length > 0 && (
              <Tree
                nodes={children}
                level={level + 1}
                expanded={expanded}
                selectedId={selectedId}
                childrenByParent={childrenByParent}
                onToggle={onToggle}
              />
            )}
          </li>
        );
      })}
    </ul>
  );
}
