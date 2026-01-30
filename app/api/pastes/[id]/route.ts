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
  { params }: { params: { id: string } }
) {
  const id = params.id;
  
  // Try to get the paste from database
  const pasteData = await kv.get(`paste:${id}`);
  
  if (!pasteData) {
    return Response.json({ error: 'Paste not found' }, { status: 404 });
  }
  
  const paste = JSON.parse(pasteData as string);
  const currentTime = getCurrentTime(request);
  
  // Check if paste has expired (time limit)
  if (paste.ttl_seconds) {
    const expiresAt = paste.created_at + (paste.ttl_seconds * 1000);
    if (currentTime >= expiresAt) {
      return Response.json({ error: 'Paste expired' }, { status: 404 });
    }
  }
  
  // Check if paste has reached view limit
  if (paste.max_views && paste.view_count >= paste.max_views) {
    return Response.json({ error: 'View limit exceeded' }, { status: 404 });
  }
  
  // Increase view count by 1
  paste.view_count += 1;
  await kv.set(`paste:${id}`, JSON.stringify(paste));
  
  // Send back the paste data
  const response = {
    content: paste.content,
    remaining_views: paste.max_views ? paste.max_views - paste.view_count : null,
    expires_at: paste.ttl_seconds 
      ? new Date(paste.created_at + paste.ttl_seconds * 1000).toISOString()
      : null,
  };
  
  return Response.json(response);
}