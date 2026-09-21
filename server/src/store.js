import { readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const dataDir = join(dirname(fileURLToPath(import.meta.url)), '../data')

export async function readJson(name) {
  const raw = await readFile(join(dataDir, name), 'utf8')
  return JSON.parse(raw)
}

export async function readVideos() {
  return readJson('videos.json')
}
