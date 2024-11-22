import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/widgets/gameoverlay')({
  component: RouteComponent,
})

function RouteComponent() {
  return 'Hello /_app/widgets/gameoverlay!'
}
