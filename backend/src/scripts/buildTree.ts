import { SEP } from '../domain/constants';
import type { DbTuple, TreeNode } from '../domain/types';

type InternalNode = TreeNode & {
  childrenMap?: Map<string, InternalNode>;
};

export function buildTreeFromLinear(rows: DbTuple[]): TreeNode {
  const root: InternalNode = { name: '__root__', size: 0, children: [], childrenMap: new Map() };

  const byFullPath = new Map<string, InternalNode>();
  byFullPath.set('', root);

  for (const row of rows) {
    const full = row.name?.trim();
    if (!full) continue;

    const parts = full.split(SEP).map((p) => p.trim()).filter(Boolean);

    let parentFullPath = '';
    let parent = root;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const currentFullPath = parentFullPath ? `${parentFullPath}${SEP}${part}` : part;

      let node = byFullPath.get(currentFullPath);
      if (!node) {
        node = { name: part, size: 0, children: [], childrenMap: new Map() };
        byFullPath.set(currentFullPath, node);

        if (!parent.children) parent.children = [];
        parent.children.push(node);
        parent.childrenMap?.set(part, node);
      }

      if (i === parts.length - 1) {
        node.size = Number(row.size ?? 0) || 0;
      }

      parent = node;
      parentFullPath = currentFullPath;
    }
  }

  const children = root.children ?? [];
  if (children.length === 1) return stripInternal(children[0]);

  return stripInternal({
    name: 'root',
    size: 0,
    children: children.map(stripInternal),
  } as InternalNode);
}

function stripInternal(node: InternalNode): TreeNode {
  const children = node.children?.map(stripInternal);
  const out: TreeNode = { name: node.name, size: node.size };
  if (children && children.length) out.children = children;
  return out;
}
