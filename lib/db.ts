import 'server-only';
import pg from 'pg';
import { dbConfig } from '../scripts/local-db-config.mjs';
const globalDb = globalThis as typeof globalThis & { cataloguePool?: pg.Pool };
export const db = globalDb.cataloguePool ?? new pg.Pool({ ...dbConfig, max: 5 });
if (process.env.NODE_ENV !== 'production') globalDb.cataloguePool = db;
