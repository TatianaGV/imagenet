import type { ApiNode } from '../../../../api/types';
import styles from './TreeNode.module.scss';

type Props = {
  node: ApiNode;
  level: number;
  isExpanded: boolean;
  isSelected: boolean;
  onToggle: (node: ApiNode) => void | Promise<void>;
};

export const TreeNode = ({
  node,
  level,
  isExpanded,
  isSelected,
  onToggle
}: Props) => {
  const rowClass = [styles.row, isSelected ? styles.rowSelected : ''].filter(Boolean).join(' ');

  const toggleClass = [
    styles.toggle,
    node.hasChildren ? styles.toggleInteractive : styles.toggleLeaf,
  ].join(' ');

  return (
    <div className={rowClass} style={{ marginLeft: level * 12 }}>
      <button
        className={toggleClass}
        onClick={() => void onToggle(node)}
        title={node.hasChildren ? (isExpanded ? 'Collapse' : 'Expand') : 'Leaf'}
        aria-expanded={node.hasChildren ? isExpanded : undefined}
        aria-label={node.hasChildren ? (isExpanded ? 'Collapse node' : 'Expand node') : 'Leaf node'}
      >
        {node.hasChildren ? (isExpanded ? '−' : '+') : '•'}
      </button>

      <div className={styles.content}>
        <div className={styles.name}>{node.name}</div>
      </div>
    </div>
  );
}
