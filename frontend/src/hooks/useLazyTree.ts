import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ApiNode } from '../api/types';
import { getAncestors, getNodes } from '../api';

export type ChildrenCache = Map<string, ApiNode[]>;

type UseLazyTreeResult = {
  error: string;
  childrenByParent: ChildrenCache;
  rootNodes: ApiNode[];
  expanded: Set<string>;
  selectedId: string;
  selectedNode: ApiNode | null;

  ensureChildrenLoaded: (parentId: string) => Promise<void>;
  toggleNode: (node: ApiNode) => Promise<void>;
  jumpTo: (path: string) => Promise<void>;
};

export const useLazyTree = (): UseLazyTreeResult => {
  const [error, setError] = useState('');

  const [childrenByParent, setChildrenByParent] = useState<ChildrenCache>(() => new Map());
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());
  const [selectedId, setSelectedId] = useState('');

  // dedupe concurrent loads: parentId -> promise
  const pendingRef = useRef<Map<string, Promise<void>>>(new Map());

  const rootNodes = childrenByParent.get('') ?? [];

  const ensureChildrenLoaded = useCallback(async (parentId: string) => {
    // already cached
    if (childrenByParent.has(parentId)) return;

    // already loading
    const pending = pendingRef.current.get(parentId);
    if (pending) return pending;

    setError('');

    const p = (async () => {
      try {
        const res = await getNodes(parentId);
        setChildrenByParent((prev) => {
          if (prev.has(parentId)) return prev;
          const next = new Map(prev);
          next.set(parentId, res.nodes);
          return next;
        });
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        pendingRef.current.delete(parentId);
      }
    })();

    pendingRef.current.set(parentId, p);
    return p;
  }, [childrenByParent]);

  const toggleNode = useCallback(
    async (node: ApiNode) => {
      setSelectedId(node.id);

      if (!node.hasChildren) return;

      setExpanded((prev) => {
        const next = new Set(prev);
        if (next.has(node.id)) next.delete(node.id);
        else next.add(node.id);
        return next;
      });

      if (!childrenByParent.has(node.id)) {
        await ensureChildrenLoaded(node.id);
      }
    },
    [childrenByParent, ensureChildrenLoaded]
  );

  const jumpTo = useCallback(
    async (path: string) => {
      setError('');
      try {
        const res = await getAncestors(path);
        const ancestors = res.ancestors ?? [];

        // expand all except last
        const toExpand = ancestors.slice(0, -1);

        // 1) batch expand in one update
        if (toExpand.length) {
          setExpanded((prev) => {
            const next = new Set(prev);
            for (const id of toExpand) next.add(id);
            return next;
          });
        }

        // 2) ensure children for expanded path sequentially
        for (const id of toExpand) {
          await ensureChildrenLoaded(id);
        }

        setSelectedId(path);
      } catch (e) {
        setStatus('error');
        setError(e instanceof Error ? e.message : String(e));
      }
    },
    [ensureChildrenLoaded]
  );

  const selectedNode = useMemo(() => {
    if (!selectedId) return null;

    for (const nodes of childrenByParent.values()) {
      const found = nodes.find((n) => n.id === selectedId);
      if (found) return found;
    }

    // fallback stub
    return { id: selectedId, name: selectedId, size: 0, hasChildren: false } as ApiNode;
  }, [childrenByParent, selectedId]);

  useEffect(() => {
    void ensureChildrenLoaded('');
  }, [ensureChildrenLoaded]);

  return {
    error,
    childrenByParent,
    rootNodes,
    expanded,
    selectedId,
    ensureChildrenLoaded,
    toggleNode,
    jumpTo,
    selectedNode,
  };
}
