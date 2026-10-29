import path from 'node:path';
import { userInfo } from 'node:os';
export const localRoot = path.join(process.cwd(), '.local-data');
export const dbConfig = { host: path.join(localRoot, 'socket'), port: 55432, user: userInfo().username, database: 'timurs_shop', connectionTimeoutMillis: 3000 };
