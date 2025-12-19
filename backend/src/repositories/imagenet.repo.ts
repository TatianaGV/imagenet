import { pool } from '../db';
import { SEP } from '../domain/constants';
import type { ApiNode, SearchItem } from '../domain/types';

const NODES_SQL = `
WITH params AS (
  SELECT
    $1::text AS parent,
    ' > '::text AS sep,
    CASE
      WHEN $1::text = '' THEN 0
      ELSE array_length(string_to_array($1::text, ' > '), 1)
    END AS d
),
children AS (
  SELECT DISTINCT
    CASE
      WHEN p.d = 0 THEN split_part(t.name, p.sep, 1)
      ELSE split_part(t.name, p.sep, p.d + 1)
    END AS child_name
  FROM imagenet_tuples t
  CROSS JOIN params p
  WHERE
    (p.d = 0)
    OR (
      t.name LIKE p.parent || p.sep || '%'
      AND split_part(t.name, p.sep, p.d + 1) <> ''
    )
),
final AS (
  SELECT
    CASE
      WHEN p.d = 0 THEN c.child_name
      ELSE p.parent || p.sep || c.child_name
    END AS id,
    c.child_name AS name,
    COALESCE(t.size, 0) AS size,
    EXISTS (
      SELECT 1
      FROM imagenet_tuples t2
      WHERE t2.name LIKE (
        CASE
          WHEN p.d = 0 THEN c.child_name
          ELSE p.parent || p.sep || c.child_name
        END
      ) || p.sep || '%'
    ) AS "hasChildren"
  FROM children c
  CROSS JOIN params p
  LEFT JOIN imagenet_tuples t
    ON t.name = CASE
      WHEN p.d = 0 THEN c.child_name
      ELSE p.parent || p.sep || c.child_name
    END
)
SELECT *
FROM final
ORDER BY name
LIMIT $2 OFFSET $3;
`;

const SEARCH_SQL = `
SELECT
  name AS id,
  split_part(name, '${SEP}', array_length(string_to_array(name, '${SEP}'), 1)) AS name,
  name AS path,
  size
FROM imagenet_tuples
WHERE name ILIKE '%' || $1 || '%'
ORDER BY
  position(lower($1) in lower(name)) NULLS LAST,
  length(name) ASC
LIMIT $2;
`;

export async function fetchNodes(params: {
  parent: string;
  limit: number;
  offset: number;
}): Promise<ApiNode[]> {
  const { parent, limit, offset } = params;
  const { rows } = await pool.query<ApiNode>(NODES_SQL, [parent, limit, offset]);
  return rows;
}

export async function searchByName(params: {
  q: string;
  limit: number;
}): Promise<SearchItem[]> {
  const { q, limit } = params;
  const { rows } = await pool.query<SearchItem>(SEARCH_SQL, [q, limit]);
  return rows;
}

