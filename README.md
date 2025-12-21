# Video Streaming Platform

A full-stack video upload, processing, and streaming platform built with modern web technologies. Upload videos, automatically encode them into multiple resolutions using FFmpeg, and stream them with HLS (HTTP Live Streaming).

## Architecture

The platform consists of three main components:

### Backend (`backend/`)
- **Framework**: Elysia.js with Bun runtime
- **Database**: PostgreSQL with Prisma ORM
- **Queue**: Redis (Upstash) for job processing
- **Features**: Video upload API, static file serving, CORS support

### Frontend (`mux-ui/`)
- **Framework**: Next.js 16 with React 19
- **Styling**: TailwindCSS
- **Player**: React Player with Media Chrome controls
- **Features**: Video upload interface, video player with adaptive streaming

### Worker (`worker/`)
- **Runtime**: Node.js
- **Processing**: FFmpeg for video encoding
- **Queue**: Redis for job management
- **Output**: HLS streams with multiple resolutions (240p, 480p, 720p, 1080p)

## Features

- **Video Upload**: Support for MP4, WebM, and MKV formats (up to 500MB)
- **Automatic Encoding**: Background processing with multiple resolution outputs
- **Adaptive Streaming**: HLS with bitrate adaptation
- **Progress Tracking**: Real-time upload progress in the UI
- **Video Playback**: Custom player with full controls

## Tech Stack

- **Backend**: Elysia.js, Bun, Prisma, PostgreSQL, Redis
- **Frontend**: Next.js, React, TypeScript, TailwindCSS
- **Worker**: Node.js, FFmpeg, Redis
- **Infrastructure**: Docker (for worker)

## Prerequisites

- **Bun** (for backend and frontend development)
- **Node.js** (for worker)
- **FFmpeg** (for video processing)
- **PostgreSQL** (database)
- **Redis** (Upstash instance for queues)
- **Docker** (optional, for containerized worker)

## Setup

### 1. Install Dependencies

```bash
# Backend
cd backend
bun install

# Frontend
cd ../mux-ui
bun install

# Worker
cd ../worker
npm install
```

### 2. Database Setup

```bash
cd backend
# Configure your PostgreSQL connection in prisma/schema.prisma
bunx prisma generate
bunx prisma db push
```

### 3. Redis Configuration

The application uses Upstash Redis. Update the connection details in:
- `backend/lib/redis.ts`
- `worker/worker.js`

### 4. Environment Setup

Ensure FFmpeg is installed on your system for video processing.

## Running the Application

### Development Mode

1. **Start Backend**:
   ```bash
   cd backend
   bun run dev
   ```
   Server runs on http://localhost:3000

2. **Start Frontend**:
   ```bash
   cd mux-ui
   bun run dev
   ```
   App runs on http://localhost:3000 (configure port if needed)

3. **Start Worker** (choose one method):

   **Option A: Direct execution**
   ```bash
   cd worker
   npm run dev
   ```

   **Option B: Docker**
   ```bash
   cd worker
   docker-compose up --build
   ```

### Production Mode

```bash
# Frontend
cd mux-ui
bun run build
bun run start

# Backend
cd backend
bun run build  # If building is configured
```

## API Endpoints

### Backend API (`http://localhost:3000`)

- `POST /video/upload` - Upload a video file
  - Accepts multipart/form-data with `video` field
  - Supported formats: MP4, WebM, MKV
  - Max size: 500MB
  - Returns: `{ message: string, id: string }`

- `GET /video/:id/index.m3u8` - Stream master playlist
- `GET /video/:id/:resolution.m3u8` - Stream specific resolution playlist
- `GET /video/:id/:segment.ts` - Stream video segments

### Frontend Routes

- `/upload` - Video upload interface
- `/w/:id` - Video player for specific video ID

## Video Processing Flow

1. **Upload**: User uploads video via frontend → stored in `backend/tmp/`
2. **Queue**: Backend pushes job to Redis queue `video-queue`
3. **Processing**: Worker pulls job, encodes to multiple resolutions using FFmpeg
4. **Storage**: Encoded files saved to `backend/output/` with HLS structure
5. **Streaming**: Frontend requests master playlist and streams adaptive video

## HLS Output Structure

```
output/
├── {video-id}/
│   ├── index.m3u8          # Master playlist
│   ├── 240p.m3u8          # 240p resolution playlist
│   ├── 480p.m3u8          # 480p resolution playlist
│   ├── 720p.m3u8          # 720p resolution playlist
│   ├── 1080p.m3u8         # 1080p resolution playlist
│   ├── 240p_000.ts        # 240p video segments
│   ├── 240p_001.ts
│   ├── ...
│   ├── 480p_000.ts        # 480p video segments
│   └── ...
```

## Configuration

### Video Resolutions

Configured in `worker/worker.js`:

```javascript
const resolutions = [
  { name: "240p", height: 240, bitrate: "400k" },
  { name: "480p", height: 480, bitrate: "800k" },
  { name: "720p", height: 720, bitrate: "1400k" },
  { name: "1080p", height: 1080, bitrate: "2800k" },
];
```

### File Limits

- Max file size: 500MB (configurable in `backend/src/routes/video.ts`)
- Supported formats: MP4, WebM, MKV

## Development Notes

- The current implementation includes a Prisma schema for a full video platform (users, channels, comments), but the API endpoints only handle basic upload/streaming
- Redis queues: `video-queue` (incoming), `video-processed` (completed), `video-crashed` (failed)
- Worker polls the queue every 60 seconds (configurable in `worker/worker.js`)
- Temporary files are cleaned up after processing

## Troubleshooting

### Common Issues

1. **FFmpeg not found**: Ensure FFmpeg is installed and available in PATH
2. **Redis connection errors**: Verify Upstash credentials and network access
3. **Port conflicts**: Backend and frontend both default to port 3000
4. **File permissions**: Ensure Docker volumes have proper permissions for tmp/output directories

### Logs

- Backend: Console output from Elysia server
- Worker: Console logs for encoding progress and errors
- Frontend: Browser console for upload/player issues

## Contributing

1. Follow the existing code style and conventions
2. Add proper error handling and validation
3. Update documentation for new features
4. Test video processing with various formats and sizes

## License

ISC