import { createFileRoute } from '@tanstack/react-router'
import LyricsPage from './_lyrics/lyrics.index'

export const Route = createFileRoute('/[username]/lyrics')({
  component: LyricsPage,
})
