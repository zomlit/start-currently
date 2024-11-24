import { Card } from '@/components/ui/card';
import { Captain, Player } from '../../types/team-picker';

interface StatsSectionProps {
  totalPlayers: number;
  requiredPlayers: number;
  totalPlayersInTeams: number;
  numTeams: number;
  teamSize: number;
  teams: Captain[];
  players: Player[];
}

const StatsSection = ({
  totalPlayers,
  requiredPlayers,
  totalPlayersInTeams,
  numTeams,
  teamSize,
  teams,
  players,
}: StatsSectionProps) => {
  // Helper function to calculate needed counts
  const calculateNeededCounts = (teams: Captain[], numTeams: number, teamSize: number, players: Player[]) => {
    // Count all existing players (both in pool and in teams)
    const playersInPool = players.filter(p => !p.isCaptain).length;
    const captainsInPool = players.filter(p => p.isCaptain).length;
    
    const playersInTeams = teams.reduce((count, team) => 
      count + team.players.filter((_, index) => index > 0).length, 0
    );
    const captainsInTeams = teams.reduce((count, team) => 
      count + (team.players.length > 0 && team.players[0].isCaptain ? 1 : 0), 0
    );

    // Calculate total existing players
    const totalExistingRegularPlayers = playersInPool + playersInTeams;
    const totalExistingCaptains = captainsInPool + captainsInTeams;

    // Calculate required numbers
    const totalCaptainsNeeded = numTeams;
    const totalRegularPlayersNeeded = numTeams * (teamSize - 1); // Subtract 1 for captain slot

    // Calculate how many more are needed
    const captainsNeeded = Math.max(0, totalCaptainsNeeded - totalExistingCaptains);
    const regularPlayersNeeded = Math.max(0, totalRegularPlayersNeeded - totalExistingRegularPlayers);

    return {
      captainsNeeded,
      regularPlayersNeeded,
      totalExistingCaptains,
      totalExistingRegularPlayers,
      totalCaptainsNeeded,
      totalRegularPlayersNeeded
    };
  };

  // Calculate player counts
  const playerCounts = {
    captains: {
      inPool: players.filter(p => p.isCaptain).length,
      inTeams: teams.reduce((count, team) => 
        count + (team.players.length > 0 && team.players[0].isCaptain ? 1 : 0), 0
      ),
      get total() { return this.inPool + this.inTeams; }
    },
    regularPlayers: {
      inPool: players.filter(p => !p.isCaptain).length,
      inTeams: teams.reduce((count, team) => 
        count + team.players.filter((_, index) => index > 0).length, 0
      ),
      get total() { return this.inPool + this.inTeams; }
    }
  };

  const neededCounts = calculateNeededCounts(teams, numTeams, teamSize, players);

  return (
    <Card className="bg-zinc-800/50 border-zinc-700/50 backdrop-blur-sm mb-4">
      <div className="p-4">
        <div className="grid grid-cols-4 gap-6">
          {/* Player Stats */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-zinc-400">Player Stats</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className={`rounded-md p-2 bg-zinc-700/50 ${
                totalPlayers === 0 
                  ? 'border-2 border-red-500/50 text-red-300' 
                  : totalPlayers < requiredPlayers
                    ? 'border-2 border-yellow-500/50 text-yellow-300'
                    : totalPlayers === requiredPlayers
                      ? 'border-2 border-green-500/50 text-white'
                      : 'border-2 border-blue-500/50 text-blue-300'
              }`}>
                <div className="text-xs opacity-75">Total Players</div>
                <div className="text-lg font-semibold">
                  {playerCounts.captains.total + playerCounts.regularPlayers.total}
                </div>
              </div>
              <div className={`rounded-md p-2 bg-zinc-700/50 ${
                totalPlayers === 0 
                  ? 'border-2 border-red-500/50 text-red-300' 
                  : totalPlayers < requiredPlayers
                    ? 'border-2 border-yellow-500/50 text-yellow-300'
                    : totalPlayers === requiredPlayers
                      ? 'border-2 border-green-500/50 text-white'
                      : 'border-2 border-blue-500/50 text-blue-300'
              }`}>
                <div className="text-xs opacity-75">Required</div>
                <div className="text-lg font-semibold">
                  {playerCounts.captains.total + playerCounts.regularPlayers.total}/
                  {neededCounts.totalCaptainsNeeded + neededCounts.totalRegularPlayersNeeded}
                </div>
              </div>
            </div>
          </div>

          {/* Team Stats */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-zinc-400">Team Stats</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className={`rounded-md p-2 bg-zinc-700/50 ${
                teams.filter(t => t.players.length === teamSize).length === 0
                  ? 'border-2 border-red-500/50 text-red-300'
                  : teams.filter(t => t.players.length === teamSize).length < numTeams
                    ? 'border-2 border-yellow-500/50 text-yellow-300'
                    : 'border-2 border-green-500/50 text-white'
              }`}>
                <div className="text-xs opacity-75">Teams Ready</div>
                <div className="text-lg font-semibold">
                  {teams.filter(t => t.players.length === teamSize).length}/{numTeams}
                </div>
              </div>
              <div className={`rounded-md p-2 bg-zinc-700/50 ${
                playerCounts.regularPlayers.inTeams + playerCounts.captains.inTeams === 0
                  ? 'border-2 border-red-500/50 text-red-300'
                  : (playerCounts.regularPlayers.inTeams + playerCounts.captains.inTeams) < (numTeams * teamSize)
                    ? 'border-2 border-yellow-500/50 text-yellow-300'
                    : 'border-2 border-green-500/50 text-white'
              }`}>
                <div className="text-xs opacity-75">Players in Teams</div>
                <div className="text-lg font-semibold">
                  {playerCounts.regularPlayers.inTeams + playerCounts.captains.inTeams}
                </div>
              </div>
            </div>
          </div>

          {/* Captain Stats */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-zinc-400">Captain Stats</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className={`rounded-md p-2 bg-zinc-700/50 ${
                neededCounts.captainsNeeded === 0
                  ? 'border-2 border-green-500/50 text-white'
                  : 'border-2 border-red-500/50 text-red-300'
              }`}>
                <div className="text-xs opacity-75">Captains Needed</div>
                <div className="text-lg font-semibold">{neededCounts.captainsNeeded}</div>
              </div>
              <div className={`rounded-md p-2 bg-zinc-700/50 ${
                playerCounts.captains.total === 0
                  ? 'border-2 border-red-500/50 text-red-300'
                  : playerCounts.captains.total < numTeams
                    ? 'border-2 border-yellow-500/50 text-yellow-300'
                    : 'border-2 border-green-500/50 text-white'
              }`}>
                <div className="text-xs opacity-75">Available Captains</div>
                <div className="text-lg font-semibold">{playerCounts.captains.total}</div>
              </div>
            </div>
          </div>

          {/* Player Distribution */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-zinc-400">Player Distribution</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className={`rounded-md p-2 bg-zinc-700/50 ${
                neededCounts.regularPlayersNeeded === 0
                  ? 'border-2 border-green-500/50 text-white'
                  : 'border-2 border-red-500/50 text-red-300'
              }`}>
                <div className="text-xs opacity-75">Players Needed</div>
                <div className="text-lg font-semibold">{neededCounts.regularPlayersNeeded}</div>
              </div>
              <div className={`rounded-md p-2 bg-zinc-700/50 ${
                playerCounts.regularPlayers.total === 0
                  ? 'border-2 border-red-500/50 text-red-300'
                  : playerCounts.regularPlayers.total < neededCounts.totalRegularPlayersNeeded
                    ? 'border-2 border-yellow-500/50 text-yellow-300'
                    : 'border-2 border-green-500/50 text-white'
              }`}>
                <div className="text-xs opacity-75">Available Players</div>
                <div className="text-lg font-semibold">{playerCounts.regularPlayers.total}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default StatsSection; 