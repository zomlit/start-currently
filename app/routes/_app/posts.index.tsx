import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/posts/')({
  component: PostsIndexComponent,
})

function PostsIndexComponent() {
  return <div>Select a post.</div>
}
