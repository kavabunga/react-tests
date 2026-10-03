import * as z from 'zod'

export const videoKindSchema = z.enum(['movie', 'animation', 'series'])

export const videoSchema = z.object({
  id: z.string(),
  title: z.string(),
  kind: videoKindSchema,
  year: z.number().nullable(),
  yearEnd: z.number().nullable(),
  overview: z.string(),
  posterUrl: z.string().nullable(),
})

export const catalogueVideoSchema = videoSchema.extend({
  isFavorite: z.boolean(),
})

export const videoListchema = z.array(catalogueVideoSchema)

export const favoriteMarkSchema = z.object({
  id: z.string(),
  isFavorite: z.boolean(),
})

export const videoListQuerySchema = z.object({
  kind: videoKindSchema.optional(),
  q: z.string().optional(),
  year: z.number().optional(),
})

export type VideoKind = z.infer<typeof videoKindSchema>
export type Video = z.infer<typeof videoSchema>
export type CatalogueVideo = z.infer<typeof catalogueVideoSchema>
export type FavoriteMark = z.infer<typeof favoriteMarkSchema>
export type VideoListQuery = z.infer<typeof videoListQuerySchema>
export type VideoList = z.infer<typeof videoListchema>
