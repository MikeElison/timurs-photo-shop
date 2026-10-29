import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { db } from './db';
// Idempotent local delivery. A crash after writing is safe: retries overwrite the
// same UUID-named file instead of producing another email.
export async function deliverOutbox() {
  const folder = path.join(process.cwd(), '.local-data', 'mail');
  await mkdir(folder, { recursive: true, mode: 0o700 });
  const messages = await db.query('SELECT * FROM email_outbox WHERE delivered_at IS NULL ORDER BY created_at LIMIT 100');
  for (const message of messages.rows) {
    await writeFile(path.join(folder, `${message.id}.txt`), `LOCAL TEST EMAIL — not sent over the internet\nTo: ${message.recipient}\nSubject: ${message.subject}\n\n${message.body}\n`, { mode: 0o600 });
    await db.query('UPDATE email_outbox SET delivered_at=now() WHERE id=$1', [message.id]);
  }
}
