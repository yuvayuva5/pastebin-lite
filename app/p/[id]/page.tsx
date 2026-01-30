import { kv } from '@vercel/kv';
import { notFound } from 'next/navigation';

async function getPaste(id: string) {
  const pasteData = await kv.get(`paste:${id}`);
  if (!pasteData) return null;
  
  const paste = JSON.parse(pasteData as string);
  const currentTime = Date.now();
  
  // Check if expired
  if (paste.ttl_seconds) {
    const expiresAt = paste.created_at + (paste.ttl_seconds * 1000);
    if (currentTime >= expiresAt) return null;
  }
  
  // Check if view limit reached
  if (paste.max_views && paste.view_count >= paste.max_views) {
    return null;
  }
  
  return paste;
}

export default async function PastePage({ 
  params 
}: { 
  params: { id: string } 
}) {
  const paste = await getPaste(params.id);
  
  if (!paste) {
    notFound();
  }
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold mb-4 text-gray-800">Paste Content</h1>
          <div className="bg-gray-100 p-4 rounded-md">
            <pre className="whitespace-pre-wrap break-words text-sm text-gray-800">
              {paste.content}
            </pre>
          </div>
          
          <div className="mt-4 text-sm text-gray-600">
            {paste.max_views && (
              <p>Views remaining: {paste.max_views - paste.view_count}</p>
            )}
            {paste.ttl_seconds && (
              <p>Expires at: {new Date(paste.created_at + paste.ttl_seconds * 1000).toLocaleString()}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}