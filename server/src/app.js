import cors from 'cors'
import express from 'express'
import { withCache } from './cache/middleware.js'
import { readFavoriteIds, readVideos, writeFavoriteIds } from './store.js'

function matchesYear(video, year) {
  if (video.year == null) return false
  if (video.yearEnd != null) {
    return video.year <= year && year <= video.yearEnd
  }
  return video.year === year
}

function withFavorite(video, favoriteIds) {
  return { ...video, isFavorite: favoriteIds.includes(video.id) }
}

async function findVideo(id) {
  const videos = await readVideos()
  return videos.find((item) => item.id === id) ?? null
}

export function createApp() {
  const app = express()
  app.set('etag', false)

  app.use(cors({ origin: 'http://localhost:5173' }))
  app.use(express.json())

  app.get('/health', (_req, res) => {
    res.json({ ok: true })
  })

  app.get('/videos', withCache('catalogue'), async (req, res) => {
    const [videos, favoriteIds] = await Promise.all([readVideos(), readFavoriteIds()])
    const kind = typeof req.query.kind === 'string' ? req.query.kind : null
    const q = typeof req.query.q === 'string' ? req.query.q.trim().toLowerCase() : ''
    const yearRaw = typeof req.query.year === 'string' ? req.query.year : null
    const year = yearRaw ? Number(yearRaw) : null

    const filtered = videos.filter((video) => {
      if (kind && video.kind !== kind) return false
      if (q && !video.title.toLowerCase().includes(q)) return false
      if (year != null && !Number.isNaN(year) && !matchesYear(video, year)) return false
      return true
    })

    res.json(filtered.map((video) => withFavorite(video, favoriteIds)))
  })

  app.get('/videos/:id', withCache('item'), async (req, res) => {
    const [video, favoriteIds] = await Promise.all([
      findVideo(req.params.id),
      readFavoriteIds(),
    ])
    if (!video) {
      res.status(404).json({ error: 'not_found' })
      return
    }
    res.json(withFavorite(video, favoriteIds))
  })

  app.put('/videos/:id/favorite', async (req, res) => {
    const video = await findVideo(req.params.id)
    if (!video) {
      res.status(404).json({ error: 'not_found' })
      return
    }
    const ids = await readFavoriteIds()
    if (!ids.includes(video.id)) {
      ids.push(video.id)
      await writeFavoriteIds(ids)
    }
    res.json({ id: video.id, isFavorite: true })
  })

  app.delete('/videos/:id/favorite', async (req, res) => {
    const video = await findVideo(req.params.id)
    if (!video) {
      res.status(404).json({ error: 'not_found' })
      return
    }
    const ids = await readFavoriteIds()
    await writeFavoriteIds(ids.filter((id) => id !== video.id))
    res.json({ id: video.id, isFavorite: false })
  })

  app.get('/favorites', withCache('favorites'), async (_req, res) => {
    const [videos, favoriteIds] = await Promise.all([readVideos(), readFavoriteIds()])
    const byId = new Map(videos.map((video) => [video.id, video]))
    const favorites = favoriteIds
      .map((id) => byId.get(id))
      .filter(Boolean)
      .map((video) => withFavorite(video, favoriteIds))
    res.json(favorites)
  })

  return app
}
