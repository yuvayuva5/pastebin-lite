# Pastebin Lite

A simple pastebin application where users can create text pastes with optional time-based expiry (TTL) and view-count limits.

## Features

- Create text pastes with unique shareable URLs
- Optional time-to-live (TTL) expiry
- Optional view-count limits
- Clean, responsive UI
- RESTful API endpoints

## Local Development

### Prerequisites

- Node.js 18+ 
- npm

### Setup

1. Clone the repository:
```bash
git clone <your-repo-url>
cd pastebin-lite
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables (for local development with Vercel KV):

Create a `.env.local` file with:
```
KV_URL=your_kv_url
KV_REST_API_URL=your_kv_rest_api_url
KV_REST_API_TOKEN=your_kv_rest_api_token
KV_REST_API_READ_ONLY_TOKEN=your_kv_rest_api_read_only_token
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Persistence Layer

This application uses **Vercel KV** (Redis) for data persistence. 

**Why Vercel KV?**
- Serverless-compatible (works with Vercel's edge functions)
- Fast read/write operations
- Simple key-value storage perfect for this use case
- Easy integration with Next.js on Vercel
- Free tier available

Each paste is stored as a JSON object with the key pattern `paste:{id}`.

## Design Decisions

1. **Next.js 14 with App Router**: Modern React framework with server components for optimal performance

2. **API Routes**: RESTful endpoints following the specification:
   - `GET /api/healthz` - Health check
   - `POST /api/pastes` - Create paste
   - `GET /api/pastes/:id` - Fetch paste (API)
   - `GET /p/:id` - View paste (HTML)

3. **View Counting**: Only API fetches (`/api/pastes/:id`) increment the view count, not HTML page views

4. **Test Mode Support**: Implements `x-test-now-ms` header support for deterministic time-based testing when `TEST_MODE=1`

5. **Security**: Paste content is rendered safely using React's default XSS protection (text is escaped by default)

6. **ID Generation**: Uses `nanoid` for short, URL-safe unique identifiers (10 characters)

7. **Error Handling**: All errors return appropriate HTTP status codes with JSON error messages

## API Documentation

### Health Check
```
GET /api/healthz
Response: { "ok": true }
```

### Create Paste
```
POST /api/pastes
Body: {
  "content": "string",       // required
  "ttl_seconds": 60,         // optional, integer >= 1
  "max_views": 5             // optional, integer >= 1
}
Response: {
  "id": "string",
  "url": "https://your-app.com/p/{id}"
}
```

### Fetch Paste (API)
```
GET /api/pastes/:id
Response: {
  "content": "string",
  "remaining_views": 4,      // null if unlimited
  "expires_at": "ISO8601"    // null if no TTL
}
```

### View Paste (HTML)
```
GET /p/:id
Returns: HTML page with paste content
Returns: 404 if paste not found or expired
```

## Deployment

This project is designed to be deployed on Vercel.

1. Push code to GitHub
2. Import project in Vercel
3. Add Vercel KV database from Storage tab
4. Deploy

## License

MIT