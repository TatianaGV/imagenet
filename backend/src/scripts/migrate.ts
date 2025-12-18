import fs from 'node:fs/promises';
import path from 'node:path';
import { pool } from '../db';

async function main() {
  const dir = path.join(process.cwd(), 'migrations');
  const files = (await fs.readdir(dir))
    .filter((f) => f.endsWith('.sql'))
    .sort();

  for (const file of files) {
    const sql = await fs.readFile(path.join(dir, file), 'utf8');
    await pool.query(sql);
    console.log(`Applied: ${file}`);
  }

  await pool.end();
}

main().catch(async (e) => {
  console.error(e);
  await pool.end();
  process.exit(1);
});
