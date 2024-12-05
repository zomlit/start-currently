import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Trophy, Users } from 'lucide-react';
import type { Captain } from '../../types/team-picker';
import { Bracket, IRoundProps, IRenderSeedProps } from 'react-brackets';
import { mutationOperations } from '@/lib/team-picker/operations';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { tournamentOperations } from '@/lib/team-picker/operations';

export type PickerMode = 'tournament' | '6mans' | 'casual' | 'ranked' | 'custom';

export interface BracketData {
  matches: Record<string, 'pending' | 'live' | 'completed'>;
  scores: Record<string, [number, number]>;
  teamAssignments: Record<string, {
    team1: {
      id: string;
      name: string;
      teamNumber: number;
      players: {
        id: string;
        name: string;
        rank?: string;
      }[];
    };
    team2: {
      id: string;
      name: string;
      teamNumber: number;
      players: {
        id: string;
        name: string;
        rank?: string;
      }[];
    };
  }>;
  isGenerated: boolean;
  totalRounds: number;
  createdAt: string;
  updatedAt: string;
}

interface BracketsSectionProps {
  mode: PickerMode;
  teams: Captain[];
  numTeams: number;
  teamSize: number;
  showTeamLogos?: boolean;
  onTeamsReorder?: (newTeams: Captain[]) => void;
  bracketData?: BracketData | null;
  onBracketDataChange?: (data: BracketData) => void;
  currentBracket: {
    id: string;
    data: {
      teams: Captain[];
      players: Player[];
      settings: {
        mode: PickerMode;
        numTeams: number;
        teamSize: number;
        showRanks: boolean;
        showTeamLogos: boolean;
        currentTheme: ThemePreset;
      };
      bracket_data?: BracketData | null;
    };
    bracket_data: BracketData | null;
  } | null;
}

type MatchStatus = 'pending' | 'live' | 'completed';

interface MatchTeam {
  id: string;
  name: string;
  score: number;
  status?: MatchStatus;
}

interface MatchSeed {
  id: string;
  date: string;
  teams: MatchTeam[];
  status?: MatchStatus;
}

interface EditingScore {
  matchId: string;
  teamIndex: number;
  value: string;
}

// Add this type for match heights
const MATCH_HEIGHTS = {
  ROUND_1: 120,  // Reduced from 160
  SUBSEQUENT: 140, // Reduced from 200
};

// Add type for mutation result
interface GenerateBracketResult {
  data: any;
  bracketData: BracketData;
}

const BracketsSectionV2: React.FC<BracketsSectionProps> = ({
  mode,
  teams,
  numTeams,
  teamSize,
  showTeamLogos = false,
  onTeamsReorder,
  bracketData,
  onBracketDataChange,
  currentBracket
}) => {
  const isReadyForBrackets = teams.every(team => team.players.length === teamSize);

  // Use refs to track state changes
  const isGeneratingRef = useRef(false);
  const [isGenerated, setIsGenerated] = useState(() => 
    currentBracket?.bracket_data?.isGenerated ?? false
  );
  const [matches, setMatches] = useState(() => 
    currentBracket?.bracket_data?.matches ?? {}
  );
  const [scores, setScores] = useState(() => 
    currentBracket?.bracket_data?.scores ?? {}
  );
  const [editingScore, setEditingScore] = useState<EditingScore | null>(null);

  const queryClient = useQueryClient();

  // Add these mutations
  const generateBracketsMutation = useMutation<GenerateBracketResult>({
    mutationFn: async () => {
      if (!currentBracket?.id) {
        throw new Error('No active bracket selected');
      }

      return tournamentOperations.generateBrackets(
        currentBracket.id,
        teams,
        numTeams
      );
    },
    onSuccess: (result) => {
      // Update local state with the generated bracket data
      setIsGenerated(true);
      setMatches(result.bracketData.matches);
      setScores(result.bracketData.scores);
      
      // Update the current bracket data in the cache
      queryClient.setQueryData(['currentBracket'], result.data);
      
      // Show success toast
      toast.success('Tournament brackets generated successfully');
    },
    onError: (error) => {
      console.error('Generate brackets error:', error);
      toast.error('Failed to generate tournament brackets');
      isGeneratingRef.current = false;
    }
  });

  const updateBracketDataMutation = useMutation({
    mutationFn: (bracketData: BracketData) => mutationOperations.updateBracketData.mutate({
      bracketId: currentBracket?.id,
      bracketData
    }),
    onSuccess: (data) => mutationOperations.updateBracketData.onSuccess(data, queryClient)
  });

  // Handle initial bracket generation
  const handleGenerateBrackets = useCallback(() => {
    if (isGeneratingRef.current) return;
    if (!currentBracket?.id) {
      toast.error('Please select a bracket first');
      return;
    }
    if (!isReadyForBrackets) {
      toast.error('Complete all team rosters before generating brackets');
      return;
    }

    isGeneratingRef.current = true;
    
    // Create initial data
    const initialMatches: Record<string, 'pending' | 'live' | 'completed'> = {};
    const initialScores: Record<string, [number, number]> = {};
    const teamAssignments: Record<string, {
      team1: {
        id: string;
        name: string;
        teamNumber: number;
        players: {
          id: string;
          name: string;
          rank?: string;
        }[];
      };
      team2: {
        id: string;
        name: string;
        teamNumber: number;
        players: {
          id: string;
          name: string;
          rank?: string;
        }[];
      };
    }> = {};

    // Create first round matches
    for (let i = 0; i < teams.length; i += 2) {
      const matchId = `round-1-match-${i/2}`;
      initialMatches[matchId] = 'pending';
      initialScores[matchId] = [0, 0];
      teamAssignments[matchId] = {
        team1: {
          id: teams[i]?.id || 'bye',
          name: teams[i]?.name || 'BYE',
          teamNumber: i + 1,
          players: teams[i]?.players.map(p => ({
            id: p.id,
            name: p.name,
            rank: p.rank
          })) || []
        },
        team2: {
          id: teams[i + 1]?.id || 'bye',
          name: teams[i + 1]?.name || 'BYE',
          teamNumber: i + 2,
          players: teams[i + 1]?.players.map(p => ({
            id: p.id,
            name: p.name,
            rank: p.rank
          })) || []
        }
      };
    }

    const bracketData: BracketData = {
      matches: initialMatches,
      scores: initialScores,
      teamAssignments,
      isGenerated: true,
      totalRounds: Math.ceil(Math.log2(numTeams)),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      generateBracketsMutation.mutate();
    } catch (error) {
      console.error('Error in handleGenerateBrackets:', error);
      toast.error('Failed to generate brackets');
    } finally {
      isGeneratingRef.current = false;
    }
  }, [currentBracket?.id, teams, numTeams, isReadyForBrackets, generateBracketsMutation]);

  // Update the auto-save effect
  useEffect(() => {
    if (!isGenerated || isGeneratingRef.current || !currentBracket?.id) return;

    // Debounce the updates
    const timeoutId = setTimeout(() => {
      const bracketData: BracketData = {
        matches,
        scores,
        teamAssignments: Object.fromEntries(
          Object.keys(matches).map(matchId => {
            const [roundStr, matchStr] = matchId.split('-match-');
            const matchIndex = parseInt(matchStr);
            const teamStartIndex = matchIndex * 2;

            return [matchId, {
              team1: {
                id: teams[teamStartIndex]?.id || 'bye',
                name: teams[teamStartIndex]?.name || 'BYE',
                teamNumber: teamStartIndex + 1,
                players: teams[teamStartIndex]?.players.map(p => ({
                  id: p.id,
                  name: p.name,
                  rank: p.rank
                })) || []
              },
              team2: {
                id: teams[teamStartIndex + 1]?.id || 'bye',
                name: teams[teamStartIndex + 1]?.name || 'BYE',
                teamNumber: teamStartIndex + 2,
                players: teams[teamStartIndex + 1]?.players.map(p => ({
                  id: p.id,
                  name: p.name,
                  rank: p.rank
                })) || []
              }
            }];
          })
        ),
        isGenerated: true,
        totalRounds: Math.ceil(Math.log2(numTeams)),
        createdAt: currentBracket.bracket_data?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      updateBracketDataMutation.mutate(bracketData);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [matches, scores, isGenerated, currentBracket?.id, teams, numTeams]);

  // Convert teams to bracket format
  const rounds = useMemo(() => {
    // If we have match details, use those
    if (currentBracket?.bracket_data?.matchDetails) {
      const { matchDetails } = currentBracket.bracket_data;
      const rounds: IRoundProps[] = [];

      // Group matches by round
      const matchesByRound = Object.values(matchDetails).reduce((acc, match) => {
        if (!acc[match.round]) acc[match.round] = [];
        acc[match.round].push(match);
        return acc;
      }, {} as Record<number, typeof matchDetails[string][]>);

      // Create rounds
      Object.entries(matchesByRound).forEach(([roundNum, matches]) => {
        rounds.push({
          title: `Round ${roundNum}`,
          seeds: matches.map(match => ({
            id: match.id,
            date: match.date,
            teams: match.teams.map(team => ({
              id: team.id,
              name: team.name,
              score: scores[match.id]?.[team.teamNumber - 1] || 0,
              status: matches[match.id] || 'pending'
            }))
          }))
        });
      });

      return rounds;
    } else {
      // Fall back to the old format
      const sortedTeams = [...teams].sort((a, b) => {
        const aIndex = teams.indexOf(a);
        const bIndex = teams.indexOf(b);
        return aIndex - bIndex;
      });

      const numRounds = Math.ceil(Math.log2(numTeams));
      const rounds: IRoundProps[] = [];

      // Create first round matches
      const firstRoundSeeds = [];
      for (let i = 0; i < sortedTeams.length; i += 2) {
        const matchId = `round-1-match-${i/2}`;
        firstRoundSeeds.push({
          id: matchId,
          date: new Date().toDateString(),
          teams: [
            {
              id: sortedTeams[i]?.id || 'bye',
              name: sortedTeams[i]?.name || 'BYE',
              score: scores[matchId]?.[0] || 0,
              status: matches[matchId] || 'pending'
            },
            {
              id: sortedTeams[i+1]?.id || 'bye',
              name: sortedTeams[i+1]?.name || 'BYE',
              score: scores[matchId]?.[1] || 0,
              status: matches[matchId] || 'pending'
            }
          ]
        });
      }

      rounds.push({
        title: 'Round 1',
        seeds: firstRoundSeeds
      });

      // Generate subsequent rounds
      for (let round = 2; round <= numRounds; round++) {
        const numMatches = Math.ceil(numTeams / Math.pow(2, round));
        const seeds = Array(numMatches).fill(null).map((_, i) => ({
          id: `round-${round}-match-${i}`,
          date: new Date().toDateString(),
          teams: [
            { id: 'tbd', name: 'TBD', score: 0, status: 'pending' },
            { id: 'tbd', name: 'TBD', score: 0, status: 'pending' }
          ]
        }));

        rounds.push({
          title: `Round ${round}`,
          seeds
        });
      }

      return rounds;
    }
  }, [currentBracket?.bracket_data, matches, scores, teams, numTeams]);

  const handleStatusChange = (matchId: string, newStatus: MatchStatus) => {
    setMatches(prev => ({
      ...prev,
      [matchId]: newStatus
    }));
  };

  const handleScoreChange = (matchId: string, teamIndex: number, score: number) => {
    setScores(prev => ({
      ...prev,
      [matchId]: teamIndex === 0 
        ? [score, prev[matchId]?.[1] || 0]
        : [prev[matchId]?.[0] || 0, score]
    }));
  };

  const determineWinner = (matchId: string) => {
    const matchScores = scores[matchId] || [0, 0];
    if (matchScores[0] > matchScores[1]) return 0;
    if (matchScores[1] > matchScores[0]) return 1;
    return -1; // Tie
  };

  // Update the CustomSeed component
  const CustomSeed = ({ seed, roundIndex }: IRenderSeedProps & { roundIndex: number }) => {
    const matchDetails = currentBracket?.bracket_data?.matchDetails?.[seed.id];
    const matchStatus = matches[seed.id] || 'pending';
    const matchScores = scores[seed.id] || [0, 0];
    const winnerIndex = matchStatus === 'completed' ? determineWinner(seed.id.toString()) : -1;

    return (
      <div 
        className={`
          relative flex flex-col
          w-[280px] bg-zinc-800/90 border border-zinc-700/50 rounded-lg overflow-hidden 
        `}
      >
        {/* Status Bar */}
        <div className={`h-1 w-full transition-colors ${
          matchStatus === 'live' ? 'bg-red-500' :
          matchStatus === 'completed' ? 'bg-green-500' :
          'bg-zinc-600'
        }`} />

        {/* Teams Container */}
        <div className="flex-1 flex flex-col divide-y divide-zinc-700/50">
          {(matchDetails?.teams || seed.teams).map((team, idx) => (
            <div key={team.id} className="flex items-center justify-between p-4">
              <div className="flex flex-col">
                <span className="font-medium">{team.name}</span>
                {matchDetails && (
                  <div className="text-xs text-zinc-400">
                    {matchDetails.teams[idx].players.map(player => (
                      <span key={player.id} className="mr-1">
                        {player.name}{player.rank ? ` (${player.rank})` : ''}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              {/* Score section */}
              <div className="flex items-center">
                <span className="text-xl font-bold px-2">
                  {matchScores[idx]}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Match Info & Controls */}
        <div className="px-4 py-2 bg-zinc-900/50 flex items-center justify-between">
          <span className="text-xs text-zinc-500">
            {seed.date}
          </span>
          
          {/* Status Controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleStatusChange(seed.id.toString(), 'pending')}
              className={`w-2 h-2 rounded-full transition-all ${
                matchStatus === 'pending' 
                  ? 'w-4 bg-zinc-400' 
                  : 'bg-zinc-600 hover:bg-zinc-500'
              }`}
              title="Set as Pending"
            />
            <button
              onClick={() => handleStatusChange(seed.id.toString(), 'live')}
              className={`w-2 h-2 rounded-full transition-all ${
                matchStatus === 'live'
                  ? 'w-4 bg-red-500' 
                  : 'bg-zinc-600 hover:bg-zinc-500'
              }`}
              title="Set as Live"
            />
            <button
              onClick={() => {
                const winner = determineWinner(seed.id.toString());
                if (winner === -1) {
                  alert('Cannot complete match with tied scores');
                  return;
                }
                handleStatusChange(seed.id.toString(), 'completed');
              }}
              className={`w-2 h-2 rounded-full transition-all ${
                matchStatus === 'completed'
                  ? 'w-4 bg-green-500' 
                  : 'bg-zinc-600 hover:bg-zinc-500'
              }`}
              title="Set as Completed"
            />
          </div>
        </div>
      </div>
    );
  };

  // Update the CustomSeedConnector component
  const CustomSeedConnector = ({ roundIndex }: { roundIndex: number }) => {
    const spacing = roundIndex === 0 ? 'w-8' : 'w-12';
    
    return (
      <div className={`${spacing} h-full flex items-center justify-center`}>
        <div className="relative w-full h-full">
          {/* Horizontal line */}
          <div className="absolute top-1/2 w-full h-[2px] bg-zinc-600/80" />
          {/* Vertical lines */}
          <div className="absolute inset-0 flex justify-center">
            <div className="w-[2px] h-full bg-zinc-600/80" />
          </div>
        </div>
      </div>
    );
  };

  // Update state when currentBracket changes
  useEffect(() => {
    if (currentBracket?.bracket_data) {
      // Check if we have valid bracket data
      const hasBracketData = currentBracket.bracket_data.matches && 
                            Object.keys(currentBracket.bracket_data.matches).length > 0;

      if (hasBracketData) {
        setIsGenerated(true);
        setMatches(currentBracket.bracket_data.matches);
        setScores(currentBracket.bracket_data.scores);
      }
    }
  }, [currentBracket?.id, currentBracket?.bracket_data]);

  // Update shouldShowBrackets check
  const shouldShowBrackets = useMemo(() => {
    return Boolean(
      isGenerated && matches && Object.keys(matches).length > 0
    );
  }, [isGenerated, matches]);

  if (mode !== 'tournament') return null;

  return (
    <Card className="bg-zinc-900/50 border-zinc-800 p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-md bg-gradient-to-br from-yellow-500/20 to-amber-500/20">
            <Trophy className="h-5 w-5 text-yellow-500" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-zinc-100">Tournament Brackets</h2>
            <p className="text-sm text-zinc-400">
              {isGenerated 
                ? `${numTeams} teams competing - Round 1` 
                : 'Ready to generate brackets'}
            </p>
          </div>
        </div>
      </div>

      {!shouldShowBrackets ? (
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3 py-3 px-4 bg-zinc-800/50 rounded-lg">
            <Users className="h-5 w-5 text-zinc-500" />
            <p className="text-sm text-zinc-400">
              {!isReadyForBrackets 
                ? 'Complete all team rosters to generate the tournament brackets'
                : `${numTeams} teams are ready to compete`
              }
            </p>
          </div>

          <div className="flex items-center justify-between py-3 px-4 bg-zinc-800/50 rounded-lg">
            <Trophy className="h-5 w-5 text-yellow-500" />
            <button
              onClick={handleGenerateBrackets}
              disabled={!isReadyForBrackets}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all
                ${isReadyForBrackets 
                  ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-yellow-950 hover:from-yellow-400 hover:to-amber-400' 
                  : 'bg-zinc-700 text-zinc-400 cursor-not-allowed'}`}
            >
              Generate Brackets
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-8 overflow-x-auto scrollbar scrollbar-w-2 scrollbar-track-transparent scrollbar-thumb-zinc-700/30 hover:scrollbar-thumb-zinc-700/50">
          <div className="min-w-[1200px] p-8">
            <Bracket
              rounds={rounds}
              renderSeedComponent={(props) => (
                <div className="relative flex items-center py-1">
                  <CustomSeed {...props} roundIndex={props.roundIndex} />
                </div>
              )}
              renderConnectorComponent={({ roundIndex }) => (
                <div className="flex-shrink-0">
                  <CustomSeedConnector roundIndex={roundIndex} />
                </div>
              )}
              roundTitleComponent={(title: string) => (
                <div className="text-sm font-medium text-zinc-400 mb-2 text-center uppercase tracking-wider">
                  {title}
                </div>
              )}
              mobileBreakpoint={768}
              bracketClassName="gap-12"
              roundClassName="gap-1"
            />
          </div>
        </div>
      )}
    </Card>
  );
};

export default BracketsSectionV2; 