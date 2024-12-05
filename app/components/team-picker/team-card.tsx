import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const TeamCard = ({ /* existing props */ }) => {
  const [showRemoveDialog, setShowRemoveDialog] = useState<{playerId: string, teamId: string} | null>(null);

  const handleRemoveClick = (playerId: string, teamId: string) => {
    console.log('🎯 Remove button clicked:', { playerId, teamId });
    setShowRemoveDialog({ playerId, teamId });
  };

  const handleConfirmRemove = async () => {
    if (!showRemoveDialog) return;
    
    console.log('🎯 Confirming remove:', showRemoveDialog);
    
    try {
      await dragDropOperations.handleRemoveFromTeam({
        playerId: showRemoveDialog.playerId,
        teamId: showRemoveDialog.teamId,
        teams,
        players,
        activeBracketId,
        settings: {
          numTeams,
          teamSize,
          showRanks,
          showTeamLogos,
          currentTheme,
          mode: currentMode
        }
      });
    } catch (error) {
      console.error('Failed to remove player:', error);
      toast.error('Failed to remove player from team');
    } finally {
      setShowRemoveDialog(null);
    }
  };

  return (
    <>
      {/* Existing team card content */}
      <button
        onClick={() => handleRemoveClick(player.id, team.id)}
        className="remove-button"
      >
        X
      </button>

      <Dialog open={!!showRemoveDialog} onOpenChange={() => setShowRemoveDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Player</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this {showRemoveDialog?.isCaptain ? 'captain' : 'player'} from the team?
              They will be moved back to the available {showRemoveDialog?.isCaptain ? 'captains' : 'players'} list.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRemoveDialog(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmRemove}>
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}; 