import { readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const dataDir = join(dirname(fileURLToPath(import.meta.url)), '../data')

export async function readJson(name) {
  const raw = await readFile(join(dataDir, name), 'utf8')
  return JSON.parse(raw)
}

export async function writeJson(name, value) {
  await writeFile(join(dataDir, name), `${JSON.stringify(value, null, 2)}\n`)
}

export async function readVideos() {
  return readJson('videos.json')
}

export async function readFavoriteIds() {
  const data = await readJson('favorites.json')
  return Array.isArray(data.ids) ? data.ids : []
}

export async function writeFavoriteIds(ids) {
  await writeJson('favorites.json', { ids })
}
