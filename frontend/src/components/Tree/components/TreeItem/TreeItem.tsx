import { memo } from 'react';
import { ApiNode } from '../../../../api/types';
import { ChildrenCache } from '../../../../hooks/useLazyTree';
import { Tree } from '../../Tree';
import { TreeNode } from '../TreeNode/TreeNode';

type TreeItemProps = {
  node: ApiNode;
  level: number;
  expanded: Set<string>;
  selectedId: string;
  childrenByParent: ChildrenCache;
  onToggle: (node: ApiNode) => void;
};

export const TreeItem = memo(function TreeItem({
  node,
  level,
  expanded,
  selectedId,
  childrenByParent,
  onToggle,
}: TreeItemProps) {
  const isExpanded = expanded.has(node.id);
  const isSelected = selectedId === node.id;

  const children = childrenByParent.get(node.id) ?? [];
  const hasChildren = children.length > 0;

  return (
    <li role="treeitem" aria-expanded={node.hasChildren ? isExpanded : undefined}>
      <TreeNode
        node={node}
        level={level}
        isExpanded={isExpanded}
        isSelected={isSelected}
        onToggle={onToggle}
      />

      {isExpanded && hasChildren && (
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
});