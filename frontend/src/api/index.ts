import { AncestorsResponse, NodesResponse, SearchResponse } from "./types";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';

async function httpGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${path}`);
  return res.json() as Promise<T>;
}

export const getNodes = (parent: string): Promise<NodesResponse> => {
  return httpGet(`/api/nodes?parent=${encodeURIComponent(parent ?? '')}`);
}

export const searchNodes = (query: string): Promise<SearchResponse> => {
  return httpGet(`/api/search?q=${encodeURIComponent(query)}`);
}

export const getAncestors = (fullPath: string): Promise<AncestorsResponse> => {
  return httpGet(`/api/ancestors?name=${encodeURIComponent(fullPath)}`);
}
