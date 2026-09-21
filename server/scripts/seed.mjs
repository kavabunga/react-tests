import { writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const FILM_TYPES = new Set([
  'Q11424', // film
  'Q24869', // feature film
  'Q202866', // animated film
  'Q229390', // 3D film
  'Q20656232', // live-action film
])

const SERIES_TYPES = new Set([
  'Q5398426', // television series
  'Q581714', // animated series
  'Q117467246', // animated television series
  'Q1259759', // miniseries
  'Q10476514', // web series
])

const ANIMATION_TYPES = new Set([
  'Q202866',
  'Q581714',
  'Q117467246',
])

const ANIMATION_GENRES = new Set([
  'Q202866',
  'Q11425', // animation as film genre
  'Q28968258', // computer-animated film
])

const SPARQL = `
SELECT DISTINCT ?item ?itemLabel ?description ?image ?inception ?start ?end ?instance ?genre WHERE {
  ?item wdt:P8345 wd:Q462 .
  VALUES ?instance {
    wd:Q11424 wd:Q24869 wd:Q202866 wd:Q229390 wd:Q20656232
    wd:Q5398426 wd:Q581714 wd:Q117467246 wd:Q1259759 wd:Q10476514
  }
  ?item wdt:P31 ?instance .
  OPTIONAL { ?item wdt:P577 ?inception }
  OPTIONAL { ?item wdt:P580 ?start }
  OPTIONAL { ?item wdt:P582 ?end }
  OPTIONAL {
    ?item schema:description ?description .
    FILTER(LANG(?description) = "en")
  }
  OPTIONAL { ?item wdt:P18 ?image }
  OPTIONAL { ?item wdt:P154 ?image }
  OPTIONAL { ?item wdt:P136 ?genre }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
`

function qid(uri) {
  return uri.split('/').pop()
}

function yearFrom(value) {
  if (!value) return null
  const year = Number(String(value).slice(0, 4))
  return Number.isFinite(year) ? year : null
}

function kindFor(instances, genres) {
  const isAnimation =
    instances.some((id) => ANIMATION_TYPES.has(id)) ||
    genres.some((id) => ANIMATION_GENRES.has(id))
  const isSeries = instances.some((id) => SERIES_TYPES.has(id))
  if (isAnimation) return 'animation'
  if (isSeries) return 'series'
  return 'movie'
}

function mergeRow(map, row) {
  const id = qid(row.item)
  let video = map.get(id)
  if (!video) {
    video = {
      id,
      title: row.itemLabel,
      kind: 'movie',
      year: null,
      yearEnd: null,
      overview: '',
      posterUrl: null,
      instances: new Set(),
      genres: new Set(),
    }
    map.set(id, video)
  }

  if (row.description && !video.overview) {
    video.overview = row.description
  }
  if (row.image && !video.posterUrl) {
    video.posterUrl = row.image
  }

  const start = yearFrom(row.start) ?? yearFrom(row.inception)
  if (start != null && (video.year == null || start < video.year)) {
    video.year = start
  }
  const end = yearFrom(row.end)
  if (end != null && (video.yearEnd == null || end > video.yearEnd)) {
    video.yearEnd = end
  }
  if (row.instance) video.instances.add(qid(row.instance))
  if (row.genre) video.genres.add(qid(row.genre))
}

function finalize(video) {
  const kind = kindFor([...video.instances], [...video.genres])
  const yearEnd = kind === 'series' || kind === 'animation' ? video.yearEnd : null
  return {
    id: video.id,
    title: video.title,
    kind,
    year: video.year,
    yearEnd,
    overview: video.overview,
    posterUrl: video.posterUrl,
  }
}

const endpoint = new URL('https://query.wikidata.org/sparql')
endpoint.searchParams.set('query', SPARQL)
endpoint.searchParams.set('format', 'json')

const response = await fetch(endpoint, {
  headers: {
    Accept: 'application/sparql-results+json',
    'User-Agent': 'react-tests-star-wars-catalogue/0.0.0 (learning project)',
  },
})

if (!response.ok) {
  throw new Error(`Wikidata SPARQL failed: ${response.status} ${await response.text()}`)
}

const payload = await response.json()
const map = new Map()

for (const binding of payload.results.bindings) {
  const row = {}
  for (const [key, cell] of Object.entries(binding)) {
    row[key] = cell.value
  }
  mergeRow(map, row)
}

const videos = [...map.values()]
  .map(finalize)
  .filter((video) => video.title && !video.title.startsWith('Q'))
  .sort((a, b) => {
    const ay = a.year ?? 9999
    const by = b.year ?? 9999
    if (ay !== by) return ay - by
    return a.title.localeCompare(b.title)
  })

const outPath = join(dirname(fileURLToPath(import.meta.url)), '../data/videos.json')
await writeFile(outPath, `${JSON.stringify(videos, null, 2)}\n`)
console.log(`Wrote ${videos.length} videos to ${outPath}`)
