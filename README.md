# Video Streaming Platform

A modern video upload and streaming platform with automatic transcoding to HLS.

## Features

- **Video Upload**: Drag-and-drop uploads with progress tracking
- **Auto Transcoding**: FFmpeg processing to multiple HLS resolutions (240p-1080p)
- **Adaptive Streaming**: Direct HLS streaming from Cloudflare R2
- **Real-time Status**: Monitor transcoding progress
- **Modern UI**: Next.js 16 + React 19 + Tailwind CSS

## Architecture

- **Web App** (`web/`): Next.js frontend with API routes
- **Worker** (`worker/`): Node.js transcoding service
- **Database**: PostgreSQL with Prisma
- **Queue**: Redis (Upstash)
- **Storage**: UploadThing (temp) + Cloudflare R2 (HLS)

## Quick Start

### 1. Install Dependencies
```bash
# Web app
cd web && npm install

# Worker
cd ../worker && npm install
```

### 2. Database Setup
```bash
cd web
npx prisma generate
npx prisma db push
```

### 3. Environment Variables

**`web/.env`:**
```env
DATABASE_URL="postgresql://..."
UPSTASH_REDIS_REST_URL="..."
UPSTASH_REDIS_REST_TOKEN="..."
R2_PUBLIC_URL="..."
UPLOADTHING_TOKEN="..."
```

**`worker/.env`:**
```env
CLOUDFLARE_ACCOUNT_ID="..."
R2_ACCESS_KEY_ID="..."
R2_SECRET_ACCESS_KEY="..."
UPSTASH_REDIS_REST_URL="..."
UPSTASH_REDIS_REST_TOKEN="..."
BACKEND_URL="http://localhost:3000"
```

### 4. Start Services
```bash
# Terminal 1: Web app
cd web && npm run dev

# Terminal 2: Worker
cd worker && npm start
```

## Usage

1. Go to http://localhost:3000/upload
2. Upload a video file
3. Monitor progress at /tasks
4. Watch at /w/{video-id}

## API Endpoints

- `POST /api/upload` - Create video record
- `POST /api/status/:id` - Update status
- `GET /api/sw/:id` - Get streaming URL
- `POST /api/delete` - Delete video

## Requirements

- Node.js 18+
- FFmpeg
- PostgreSQL
- Redis (Upstash)
- Cloudflare R2
- UploadThing account

## Deployment

- **Frontend**: Vercel
- **Worker**: Docker/Railway
- **Database**: Railway/Supabase

## Troubleshooting

- Ensure FFmpeg is installed: `ffmpeg -version`
- Check database: `npx prisma studio`
- View logs in terminal for both services