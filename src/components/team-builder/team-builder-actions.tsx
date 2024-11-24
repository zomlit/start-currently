import { Button } from "@/components/ui/button"
import { useTeamStore } from "../../stores/team-store"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function TeamBuilderActions({ 
  onShuffle, 
  onBalance 
}: { 
  onShuffle: () => void
  onBalance: () => void 
}) {
  const { players, captains } = useTeamStore()
  const hasPlayers = players.length > 0
  const hasCaptains = captains.length > 0
  const isActionable = hasPlayers && hasCaptains
  
  const tooltipMessage = () => {
    if (!hasPlayers && !hasCaptains) return "Add players and captains to begin"
    if (!hasPlayers) return "Add players to begin"
    if (!hasCaptains) return "Add captains to begin"
    return ""
  }

  return (
    <div className="flex gap-2 justify-end p-4">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="outline" 
              disabled={!isActionable}
              onClick={onShuffle}
            >
              Shuffle Teams
            </Button>
          </TooltipTrigger>
          {!isActionable && (
            <TooltipContent>
              <p>{tooltipMessage()}</p>
            </TooltipContent>
          )}
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              disabled={!isActionable}
              onClick={onBalance}
            >
              Balance Teams
            </Button>
          </TooltipTrigger>
          {!isActionable && (
            <TooltipContent>
              <p>{tooltipMessage()}</p>
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
    </div>
  )
} 