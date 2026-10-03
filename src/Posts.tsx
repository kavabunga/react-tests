import { usePosts } from './usePosts'

export function Posts() {
  const usePostsResult = usePosts()

  if (usePostsResult.isPending) return <p>Loading...</p>
  if (usePostsResult.error) return <p>{usePostsResult.error.message}</p>

  return (
    <ul>
      {usePostsResult.data.map((post) => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  )
}
