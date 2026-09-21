import { createHash } from 'node:crypto'
import { cachePresets } from './presets.js'

function weakEtag(body) {
  const hash = createHash('sha1').update(body).digest('hex')
  return `W/"${hash}"`
}

export function withCache(presetName) {
  const preset = cachePresets[presetName]
  if (!preset) {
    throw new Error(`Unknown cache preset: ${presetName}`)
  }

  return (req, res, next) => {
    res.setHeader('Cache-Control', preset.cacheControl)
    if (!preset.etag) {
      next()
      return
    }

    const sendJson = res.json.bind(res)
    res.json = (payload) => {
      const body = JSON.stringify(payload)
      const etag = weakEtag(body)
      res.setHeader('ETag', etag)
      if (req.headers['if-none-match'] === etag) {
        res.status(304).end()
        return res
      }
      return sendJson(payload)
    }
    next()
  }
}
