import axios from 'axios';
import { XMLParser } from 'fast-xml-parser';
import { SEP } from '../domain/constants';

export type LinearNode = { name: string; size: number };

type XmlSynset = {
  '@_words'?: string;
  '@_wnid'?: string;
  '@_gloss'?: string;
  '@_numImages'?: string | number;
  synset?: XmlSynset[] | XmlSynset;
  [k: string]: any;
};

const XML_URL =
  'https://raw.githubusercontent.com/tzutalin/ImageNet_Utils/master/detection_eval_tools/structure_released.xml';

function asArray<T>(v: T | T[] | undefined): T[] {
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
}

function findRootSynset(parsed: any): XmlSynset | undefined {
  if (!parsed || typeof parsed !== 'object') return undefined;

  if (parsed?.ImageNetStructure?.synset) return parsed.ImageNetStructure.synset as XmlSynset;

  for (const v of Object.values(parsed)) {
    if (v && typeof v === 'object' && (v as any).synset) return (v as any).synset as XmlSynset;
  }

  for (const v of Object.values(parsed)) {
    if (!v || typeof v !== 'object') continue;
    for (const vv of Object.values(v as any)) {
      if (vv && typeof vv === 'object' && (vv as any).synset) return (vv as any).synset as XmlSynset;
    }
  }

  return undefined;
}

function toNumberOrZero(v: unknown): number {
  if (v === undefined || v === null || v === '') return 0;
  const n = typeof v === 'number' ? v : Number(String(v));
  return Number.isFinite(n) ? n : 0;
}

export async function parseImageNet(): Promise<LinearNode[]> {
  const xml = await axios.get(XML_URL, { responseType: 'text' }).then((r) => r.data);

  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    trimValues: true,
  });

  const parsed = parser.parse(xml);

  const root = findRootSynset(parsed);
  if (!root) {
    const topKeys = parsed && typeof parsed === 'object' ? Object.keys(parsed) : [];
    throw new Error(`Invalid XML: cannot find root synset. Top keys: ${topKeys.join(', ')}`);
  }

  const result: LinearNode[] = [];

  function getName(node: XmlSynset): string {
    return String(node['@_words'] ?? '').trim();
  }

  function getSize(node: XmlSynset): number {
    return toNumberOrZero(node['@_numImages']);
  }

  function walk(node: XmlSynset, path: string[]) {
    const nodeName = getName(node);
    const currentPath = nodeName ? [...path, nodeName] : path;
    const fullName = currentPath.join(SEP);

    result.push({ name: fullName, size: getSize(node) });

    for (const child of asArray(node.synset)) {
      walk(child, currentPath);
    }
  }

  walk(root, []);
  return result;
}
