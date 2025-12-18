import { pool } from '../db';
import { SEP } from '../domain/constants';
import type { ApiNode, SearchItem } from '../domain/types';

const NODES_SQL = `
WITH params AS (
  SELECT
    $1::text AS parent,
    CASE
      WHEN $1::text = '' THEN 0
      ELSE array_length(string_to_array($1::text, '${SEP}'), 1)
    END AS d
),
candidates AS (
  SELECT
    (string_to_array(t.name, '${SEP}')) AS parts
  FROM imagenet_tuples t, params p
  WHERE
    (p.d = 0)
    OR (
      t.name LIKE p.parent || '${SEP}%' AND
      array_to_string((string_to_array(t.name, '${SEP}'))[1:p.d], '${SEP}') = p.parent
    )
),
children AS (
  SELECT DISTINCT
    parts[(SELECT d FROM params) + 1] AS child_name
  FROM candidates
  WHERE parts[(SELECT d FROM params) + 1] IS NOT NULL
),
final AS (
  SELECT
    CASE
      WHEN p.d = 0 THEN c.child_name
      ELSE p.parent || '${SEP}' || c.child_name
    END AS id,
    c.child_name AS name,
    COALESCE(t.size, 0) AS size,
    EXISTS (
      SELECT 1
      FROM imagenet_tuples t2
      WHERE t2.name LIKE (
        CASE
          WHEN p.d = 0 THEN c.child_name
          ELSE p.parent || '${SEP}' || c.child_name
        END
      ) || '${SEP}%'
    ) AS "hasChildren"
  FROM children c
  CROSS JOIN params p
  LEFT JOIN imagenet_tuples t
    ON t.name = CASE
      WHEN p.d = 0 THEN c.child_name
      ELSE p.parent || '${SEP}' || c.child_name
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

