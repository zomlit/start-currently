import { SignUp } from '@clerk/tanstack-start'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/sign-up/$')({
  component: Page,
})

function Page() {
  return <SignUp />
}
