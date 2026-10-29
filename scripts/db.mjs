import { mkdir, access, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import pg from 'pg';
import { localRoot, dbConfig } from './local-db-config.mjs';
const data = path.join(localRoot, 'postgres');
function run(command, args) {
  const result = spawnSync(command, args, { stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${command} failed (${result.status})`);
}
async function exists(file) { try { await access(file); return true; } catch { return false; } }
if (process.argv[2] === 'stop') {
  run('pg_ctl', ['-D', data, '-m', 'fast', '-w', 'stop']);
} else {
  await mkdir(localRoot, { recursive: true, mode: 0o700 });
  await mkdir(dbConfig.host, { recursive: true, mode: 0o700 });
  if (!await exists(path.join(data, 'PG_VERSION'))) run('initdb', ['-D', data, '-A', 'trust', '--encoding=UTF8', '--locale=C']);
  const status = spawnSync('pg_ctl', ['-D', data, 'status'], { stdio: 'ignore' });
  if (status.status !== 0) {
    // Unix socket only, in a directory accessible to this OS user. No TCP listener.
    const socket = dbConfig.host.replaceAll("'", "'\\''");
    run('pg_ctl', ['-D', data, '-l', path.join(localRoot, 'postgres.log'), '-o', `-h '' -p ${dbConfig.port} -k '${socket}'`, '-w', 'start']);
  }
  const bootstrap = new pg.Client({ ...dbConfig, database: 'postgres' });
  await bootstrap.connect();
  try {
    if (!(await bootstrap.query('SELECT 1 FROM pg_database WHERE datname = $1', [dbConfig.database])).rowCount) await bootstrap.query('CREATE DATABASE timurs_shop');
  } finally { await bootstrap.end(); }
  const client = new pg.Client(dbConfig);
  await client.connect();
  try {
    await client.query('BEGIN');
    await client.query('CREATE TABLE IF NOT EXISTS migrations (name text PRIMARY KEY)');
    await client.query('SELECT pg_advisory_xact_lock(731982)');
    for (const file of (await readdir('db/migrations')).filter(file => /^\d+_.*\.sql$/.test(file)).sort()) {
      const name = file.slice(0, -4);
      if (!(await client.query('SELECT 1 FROM migrations WHERE name = $1', [name])).rowCount) {
        await client.query(await readFile(`db/migrations/${file}`, 'utf8'));
        await client.query('INSERT INTO migrations(name) VALUES($1)', [name]);
      }
    }
    await client.query('COMMIT');
    console.log('Local catalogue database is ready. Run npm run dev and open /admin.');
  } catch (error) { await client.query('ROLLBACK'); throw error; }
  finally { await client.end(); }
}
