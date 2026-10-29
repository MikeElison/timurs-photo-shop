import pg from 'pg';
import { dbConfig } from './local-db-config.mjs';
const email=(process.argv[2]??'').trim().toLowerCase();
if(email.length>254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Usage: npm run admin:add -- your-email@example.com');
const client=new pg.Client(dbConfig);await client.connect();
try {await client.query('INSERT INTO administrators(email) VALUES($1) ON CONFLICT DO NOTHING',[email]);console.log('Administrator authorised. Request a sign-in link at /admin/sign-in.');} finally {await client.end();}
