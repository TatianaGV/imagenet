export type ApiNode = {
  id: string;
  name: string;
  size: number;
  hasChildren: boolean;
};

export type NodesResponse = {
  parent: string;
  limit: number;
  offset: number;
  nodes: ApiNode[];
};

export type SearchItem = {
  id: string;
  name: string;
  path: string;
  size: number;
};

export type SearchResponse = {
  q: string;
  items: SearchItem[];
};

export type AncestorsResponse = {
  name: string;
  ancestors: string[];
};