import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ApiNode } from '../api/types';
import { getAncestors, getNodes } from '../api';

export type ChildrenCache = Map<string, ApiNode[]>;

type UseLazyTreeResult = {
  error: string | null;

  childrenByParent: ChildrenCache;
  rootNodes: ApiNode[];
  expanded: Set<string>;
  selectedId: string;
  selectedNode: ApiNode | null;

  loadingByParent: Set<string>;

  ensureChildrenLoaded: (parentId: string) => Promise<void>;
  toggleNode: (node: ApiNode) => Promise<void>;
  jumpTo: (path: string) => Promise<void>;
};

export const useLazyTree = (): UseLazyTreeResult => {
  const [error, setError] = useState<string | null>(null);

  const [childrenByParent, setChildrenByParent] = useState<ChildrenCache>(() => new Map());
  const childrenByParentRef = useRef(childrenByParent);

  useEffect(() => {
    childrenByParentRef.current = childrenByParent;
  }, [childrenByParent]);

  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());
  const [selectedId, setSelectedId] = useState('');

  const pendingRef = useRef<Map<string, Promise<void>>>(new Map());

  const [loadingByParent, setLoadingByParent] = useState<Set<string>>(() => new Set());

  const jumpSeqRef = useRef(0);

  const rootNodes = childrenByParent.get('') ?? [];

  const ensureChildrenLoaded = useCallback(async (parentId: string) => {
    if (childrenByParentRef.current.has(parentId)) return;

    const pending = pendingRef.current.get(parentId);
    if (pending) return pending;

    setError(null);
    setLoadingByParent((prev) => {
      if (prev.has(parentId)) return prev;
      const next = new Set(prev);
      next.add(parentId);
      return next;
    });

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
        setLoadingByParent((prev) => {
          if (!prev.has(parentId)) return prev;
          const next = new Set(prev);
          next.delete(parentId);
          return next;
        });
      }
    })();

    pendingRef.current.set(parentId, p);
    return p;
  }, []);

  const toggleNode = useCallback(
    async (node: ApiNode) => {
      setSelectedId(node.id);

      if (!node.hasChildren) return;

      const willExpand = !expanded.has(node.id);

      setExpanded((prev) => {
        const next = new Set(prev);
        if (next.has(node.id)) next.delete(node.id);
        else next.add(node.id);
        return next;
      });

      if (willExpand && !childrenByParentRef.current.has(node.id)) {
        await ensureChildrenLoaded(node.id);
      }
    },
    [ensureChildrenLoaded, expanded]
  );

  const jumpTo = useCallback(
    async (path: string) => {
      const seq = ++jumpSeqRef.current;
      setError(null);

      try {
        const res = await getAncestors(path);
        const ancestors = res.ancestors ?? [];
        const toExpand = ancestors.slice(0, -1);

        if (toExpand.length) {
          setExpanded((prev) => {
            const next = new Set(prev);
            for (const id of toExpand) next.add(id);
            return next;
          });
        }

        for (const id of toExpand) {
          if (seq !== jumpSeqRef.current) return;
          await ensureChildrenLoaded(id);
        }

        if (seq !== jumpSeqRef.current) return;
        setSelectedId(path);
      } catch (e) {
        if (seq !== jumpSeqRef.current) return;
        setError(e instanceof Error ? e.message : String(e));
      }
    },
    [ensureChildrenLoaded]
  );

  const nodeIndex = useMemo(() => {
    const idx = new Map<string, ApiNode>();
    for (const nodes of childrenByParent.values()) {
      for (const n of nodes) idx.set(n.id, n);
    }
    return idx;
  }, [childrenByParent]);

  const selectedNode = useMemo(() => {
    if (!selectedId) return null;
    return nodeIndex.get(selectedId) ?? null;
  }, [nodeIndex, selectedId]);

  useEffect(() => {
    void ensureChildrenLoaded('');
  }, [ensureChildrenLoaded]);

  return {
    error,
    childrenByParent,
    rootNodes,
    expanded,
    selectedId,
    selectedNode,
    loadingByParent,
    ensureChildrenLoaded,
    toggleNode,
    jumpTo,
  };
};
