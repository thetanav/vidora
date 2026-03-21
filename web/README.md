# Vidora Web

The web app is a Next.js dashboard and playback surface for Vidora.

## Responsibilities

- Handles Google authentication with NextAuth
- Accepts uploads and enqueues worker jobs
- Shows user-scoped library and job state
- Serves playback metadata and public watch pages

## Development

```bash
npm install
npm run generate
npm run dev
```

Open `http://localhost:3000`.

## Required Environment

```env
DATABASE_URL="postgresql://..."
UPSTASH_REDIS_REST_URL="..."
UPSTASH_REDIS_REST_TOKEN="..."
R2_PUBLIC_URL="https://..."
NEXT_PUBLIC_R2_PUBLIC_URL="https://..."
UPLOADTHING_TOKEN="..."
AUTH_GOOGLE_ID="..."
AUTH_GOOGLE_SECRET="..."
AUTH_SECRET="..."
WORKER_SHARED_SECRET=""
```

Set `WORKER_SHARED_SECRET` in both `web/.env` and `worker/.env` if you want the worker callback endpoint to require a shared secret.
