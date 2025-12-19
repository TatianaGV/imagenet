import { memo, useCallback, useMemo } from 'react';
import type { ApiNode } from '../../../../api/types';
import styles from './TreeNode.module.scss';

type Props = {
  node: ApiNode;
  level: number;
  isExpanded: boolean;
  isSelected: boolean;
  onToggle: (node: ApiNode) => void | Promise<void>;
};

type ToggleMeta = {
  icon: string;
  title: string;
  ariaLabel: string;
  disabled: boolean;
  ariaExpanded?: boolean;
};

const INDENT_PX = 12;

const cn = (...parts: Array<string | false | null | undefined>) =>
  parts.filter(Boolean).join(' ');


const getToggleMeta = (hasChildren: boolean, isExpanded: boolean): ToggleMeta => {
  if (!hasChildren) {
    return {
      icon: '•',
      title: 'Leaf',
      ariaLabel: 'Leaf node',
      disabled: true,
    };
  }

  if (isExpanded) {
    return {
      icon: '−',
      title: 'Collapse',
      ariaLabel: 'Collapse node',
      disabled: false,
      ariaExpanded: true,
    };
  }

  return {
    icon: '+',
    title: 'Expand',
    ariaLabel: 'Expand node',
    disabled: false,
    ariaExpanded: false,
  };
};

export const TreeNode = memo(function TreeNode({
  node,
  level,
  isExpanded,
  isSelected,
  onToggle,
}: Props) {
  const toggle = useMemo(
    () => getToggleMeta(node.hasChildren, isExpanded),
    [node.hasChildren, isExpanded],
  );

  const handleToggle = useCallback(() => {
    if (toggle.disabled) return;
    void onToggle(node);
  }, [toggle.disabled, node, onToggle]);

  return (
    <div
      className={cn(styles.row, isSelected && styles.rowSelected)}
      style={{ paddingLeft: level * INDENT_PX }}
      aria-selected={isSelected}
    >
      <button
        type="button"
        className={cn(
          styles.toggle,
          toggle.disabled ? styles.toggleLeaf : styles.toggleInteractive,
        )}
        disabled={toggle.disabled}
        onClick={handleToggle}
        title={toggle.title}
        aria-label={toggle.ariaLabel}
        aria-expanded={toggle.ariaExpanded}
      >
        {toggle.icon}
      </button>

      <div className={styles.content}>
        <div className={styles.name}>{node.name}</div>
      </div>
    </div>
  );
});
