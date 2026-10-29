import { findUploaded } from '../../../lib/catalog';
import { requireLocalAdmin } from '../../../lib/admin-access';
import { readPreview } from '../../../lib/photo-storage';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const photo = await findUploaded(id, false);
  if (!photo) return new Response(null, { status: 404 });
  if (!photo.published) await requireLocalAdmin();
  try {
    const bytes = await readPreview(id);
    return new Response(new Uint8Array(bytes), { headers: { 'Content-Type': 'image/jpeg', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } });
  } catch { return new Response(null, { status: 404 }); }
}
