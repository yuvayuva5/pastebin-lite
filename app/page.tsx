'use client';

import { useState } from 'react';

export default function Home() {
  const [content, setContent] = useState('');
  const [ttl, setTtl] = useState('');
  const [maxViews, setMaxViews] = useState('');
  const [result, setResult] = useState<{ url: string; id: string } | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);

    const body: any = { content };
    if (ttl) body.ttl_seconds = parseInt(ttl);
    if (maxViews) body.max_views = parseInt(maxViews);

    try {
      const res = await fetch('/api/pastes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to create paste');
        return;
      }

      setResult(data);
      setContent('');
      setTtl('');
      setMaxViews('');
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <h1 className="text-4xl font-bold mb-2 text-gray-800">Pastebin Lite</h1>
        <p className="text-gray-600 mb-8">Share text snippets with optional expiry</p>
        
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Paste Content *
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={10}
              placeholder="Enter your text here..."
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time to Live (seconds)
              </label>
              <input
                type="number"
                value={ttl}
                onChange={(e) => setTtl(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Optional"
                min="1"
              />
              <p className="text-xs text-gray-500 mt-1">Leave empty for no expiry</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Views
              </label>
              <input
                type="number"
                value={maxViews}
                onChange={(e) => setMaxViews(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Optional"
                min="1"
              />
              <p className="text-xs text-gray-500 mt-1">Leave empty for unlimited</p>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition-colors"
          >
            {loading ? 'Creating...' : 'Create Paste'}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {result && (
          <div className="mt-4 p-6 bg-green-50 border border-green-200 rounded-md">
            <p className="font-semibold text-green-800 mb-2">✓ Paste created successfully!</p>
            <div className="bg-white p-3 rounded border border-green-300">
              <p className="text-sm text-gray-600 mb-1">Share this link:</p>
              
<a
                href={result.url}
                className="text-blue-600 hover:underline break-all font-mono text-sm"
                target="_blank"
                rel="noopener noreferrer"
>
                {result.url}
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}