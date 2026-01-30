import { kv } from '@vercel/kv';
import { nanoid } from 'nanoid';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Check if content exists and is not empty
    if (!body.content || typeof body.content !== 'string' || body.content.trim() === '') {
      return Response.json({ error: 'Content is required and must be non-empty' }, { status: 400 });
    }
    
    // Check ttl_seconds if provided
    if (body.ttl_seconds !== undefined) {
      if (!Number.isInteger(body.ttl_seconds) || body.ttl_seconds < 1) {
        return Response.json({ error: 'ttl_seconds must be an integer >= 1' }, { status: 400 });
      }
    }
    
    // Check max_views if provided
    if (body.max_views !== undefined) {
      if (!Number.isInteger(body.max_views) || body.max_views < 1) {
        return Response.json({ error: 'max_views must be an integer >= 1' }, { status: 400 });
      }
    }
    
    // Create a unique ID for this paste
    const id = nanoid(10);
    
    // Create the paste object
    const paste = {
      id,
      content: body.content,
      created_at: Date.now(),
      ttl_seconds: body.ttl_seconds,
      max_views: body.max_views,
      view_count: 0,
    };
    
    // Save to database
    await kv.set(`paste:${id}`, JSON.stringify(paste));
    
    // Create the shareable URL
    const protocol = request.headers.get('x-forwarded-proto') || 'https';
    const host = request.headers.get('host') || 'localhost:3000';
    const baseUrl = `${protocol}://${host}`;
    const url = `${baseUrl}/p/${id}`;
    
    return Response.json({ id, url });
  } catch (error) {
    return Response.json({ error: 'Invalid request' }, { status: 400 });
  }
}