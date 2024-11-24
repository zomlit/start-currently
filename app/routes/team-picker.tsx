import { createFileRoute } from '@tanstack/react-router'
import TeamPickerV2 from '@/components/TeamPickerV2'

export const Route = createFileRoute('/team-picker')({
  component: TeamPickerV2,
}) 