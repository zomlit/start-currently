import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/_authed/bun')({
  component: () => <div>Hello /_app/bun!</div>,
})
