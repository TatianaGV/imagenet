import { pool } from '../db';
import { parseImageNet } from './parseImageNet';

async function main() {
  const rows = await parseImageNet();

  const map = new Map<string, number>();
  for (const r of rows) {
    map.set(r.name, r.size);
  }

  const unique = Array.from(map.entries()).map(([name, size]) => ({ name, size }));

  const BATCH = 1000;

  for (let i = 0; i < unique.length; i += BATCH) {
    const batch = unique.slice(i, i + BATCH);

    const values: any[] = [];
    const placeholders = batch
      .map((r, idx) => {
        const p1 = idx * 2 + 1;
        const p2 = idx * 2 + 2;
        values.push(r.name, r.size);
        return `($${p1}, $${p2})`;
      })
      .join(',');

    await pool.query(
      `
      INSERT INTO imagenet_tuples (name, size)
      VALUES ${placeholders}
      ON CONFLICT (name) DO UPDATE
      SET size = EXCLUDED.size
      `,
      values
    );
  }

  await pool.end();
}

main().catch(console.error);
