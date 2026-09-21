import cors from 'cors'
import express from 'express'
import { readVideos } from './store.js'

function matchesYear(video, year) {
  if (video.year == null) return false
  if (video.yearEnd != null) {
    return video.year <= year && year <= video.yearEnd
  }
  return video.year === year
}

export function createApp() {
  const app = express()

  app.use(cors({ origin: 'http://localhost:5173' }))
  app.use(express.json())

  app.get('/health', (_req, res) => {
    res.json({ ok: true })
  })

  app.get('/videos', async (req, res) => {
    const videos = await readVideos()
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

    res.json(filtered)
  })

  return app
}
