import { kv } from '@vercel/kv';

function getCurrentTime(request: Request): number {
  const testMode = process.env.TEST_MODE === '1';
  if (testMode) {
    const testNow = request.headers.get('x-test-now-ms');
    if (testNow) {
      return parseInt(testNow, 10);
    }
  }
  return Date.now();
}

export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const id = params.id;
  
  const pasteData = await kv.get(`paste:${id}`);
  
  if (!pasteData) {
    return Response.json({ error: 'Paste not found' }, { status: 404 });
  }
  
  const paste = JSON.parse(pasteData as string);
  const currentTime = getCurrentTime(request);
  
  // Check TTL expiry
  if (paste.ttl_seconds) {
    const expiresAt = paste.created_at + (paste.ttl_seconds * 1000);
    if (currentTime >= expiresAt) {
      return Response.json({ error: 'Paste expired' }, { status: 404 });
    }
  }
  
  // Check view limit BEFORE incrementing
  if (paste.max_views && paste.view_count >= paste.max_views) {
    return Response.json({ error: 'View limit exceeded' }, { status: 404 });
  }
  
  // Increment view count
  paste.view_count += 1;
  await kv.set(`paste:${id}`, JSON.stringify(paste));
  
  // Build response
  const response = {
    content: paste.content,
    remaining_views: paste.max_views ? paste.max_views - paste.view_count : null,
    expires_at: paste.ttl_seconds 
      ? new Date(paste.created_at + paste.ttl_seconds * 1000).toISOString()
      : null,
  };
  
  return Response.json(response);
}