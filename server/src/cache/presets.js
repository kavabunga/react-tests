export const cachePresets = {
  catalogue: {
    cacheControl: 'public, max-age=60',
    etag: true,
  },
  item: {
    cacheControl: 'public, max-age=300',
    etag: true,
  },
  favorites: {
    cacheControl: 'no-store',
    etag: false,
  },
}
