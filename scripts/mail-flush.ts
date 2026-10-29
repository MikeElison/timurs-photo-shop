import { deliverOutbox } from '../lib/outbox';
import { db } from '../lib/db';
try {
  await deliverOutbox();
  console.log('Pending local emails written to .local-data/mail.');
} finally { await db.end(); }
