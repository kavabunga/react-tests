import { useQuery } from '@tanstack/react-query'

export type Post = {
  id: number
  title: string
}

function fetchPosts(): Promise<Post[]> {
  return fetch('https://jsonplaceholder.typicode.com/posts').then((res) => res.json())
}

export function usePosts() {
  return useQuery({
    queryKey: ['posts'],
    queryFn: fetchPosts,
  })
}
