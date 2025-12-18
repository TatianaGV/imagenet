export type DbTuple = {
  name: string; // "A > B > C"
  size: number;
};

export type TreeNode = {
  name: string;
  size: number;
  children?: TreeNode[];
};

export type ApiNode = {
  id: string;
  name: string;
  size: number;
  hasChildren: boolean;
};

export type SearchItem = {
  id: string;
  name: string;
  path: string;
  size: number;
};