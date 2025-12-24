import { Hono } from 'hono'
import { z } from 'zod'
import { nanoid } from 'nanoid'
import path from 'path'
import { mkdir } from 'node:fs/promises'
import { redis } from '../../lib/redis'

type VideoMeta = {
  id: string
  title: string
  description: string
  ext: string
  status: 'queued' | 'processing' | 'ready' | 'failed'
  createdAt: number
}

const QUALITIES = ['240p', '480p', '720p', '1080p'] as const

type PlaybackInfo = {
  master: string
  variants: Array<{ quality: (typeof QUALITIES)[number]; path: string }>
}

export const video = new Hono()

video.post('/upload', async (c) => {
  const formData = await c.req.formData()
  const videoFile = formData.get('video') as File
  const title = formData.get('title') as string
  const description = formData.get('description') as string

  // Validate
  const bodySchema = z.object({
    title: z.string().trim().min(1).max(120),
    description: z.string().trim().max(5000).default(''),
    video: z.instanceof(File).refine((file) => file.size <= 1000 * 1024 * 1024, {
      message: 'Max file size is 1gb',
    }).refine((file) => ['video/mp4', 'video/webm', 'video/mkv'].includes(file.type), {
      message: 'Unsupported video format',
    }),
  })

  const validation = bodySchema.safeParse({ title, description, video: videoFile })
  if (!validation.success) {
    return c.json({ error: validation.error.issues }, 400)
  }

  const { video, title: validTitle, description: validDesc } = validation.data

  const extension = video.name.split('.').pop()!
  const id = nanoid(9)

  await mkdir('tmp', { recursive: true })
  const filePath = path.join('tmp', `${id}.${extension}`)

  const file = Bun.file(filePath)
  const writer = file.writer()

  const reader = video.stream().getReader()

  let total = 0
  const MAX = 1000 * 1024 * 1024

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    total += value.length
    if (total > MAX) {
      writer.end()
      return c.json({ error: 'File too large' }, 413)
    }

    writer.write(value)
  }

  writer.end()

  const meta: VideoMeta = {
    id,
    title: validTitle,
    description: validDesc,
    ext: extension,
    status: 'queued',
    createdAt: Date.now(),
  }

  await redis.set(`video:${id}`, JSON.stringify(meta))
  await redis.lpush('video-queue', JSON.stringify({ name: id, ext: extension }))

  return c.json({
    message: 'Upload successful',
    id,
  })
})

video.get('/:id', async (c) => {
  const id = c.req.param('id')
  const raw = await redis.get<string>(`video:${id}`)
  if (!raw) {
    return c.json({ message: 'Not found' }, 404)
  }

  const meta = JSON.parse(raw) as VideoMeta

  const masterFile = Bun.file(path.join('output', id, 'index.m3u8'))
  const isReady = await masterFile.exists()

  const variants = await Promise.all(
    QUALITIES.map(async (q) => {
      const file = Bun.file(path.join('output', id, `${q}.m3u8`))
      const exists = await file.exists()
      return exists ? { quality: q, path: `/video/${id}/${q}.m3u8` } : null
    })
  )

  const playback: PlaybackInfo = {
    master: `/video/${id}/index.m3u8`,
    variants: variants.filter(Boolean) as PlaybackInfo['variants'],
  }

  return c.json({
    id: meta.id,
    title: meta.title,
    description: meta.description,
    status: isReady ? 'ready' : meta.status,
    playback,
  })
})