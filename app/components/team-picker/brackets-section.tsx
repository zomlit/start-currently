import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Trophy, Users, ArrowRight, ChevronRight, Check } from 'lucide-react';
import type { Captain } from '../../types/team-picker';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

// First, let's export the PickerMode type from TeamPickerV2
export type PickerMode = 'tournament' | '6mans' | 'casual' | 'ranked' | 'custom';

interface BracketsSectionProps {
  mode: PickerMode;
  teams: Captain[];
  numTeams: number;
  teamSize: number;
  showTeamLogos?: boolean;
  onTeamsReorder?: (newTeams: Captain[]) => void;
}

interface MatchScore {
  team1: number;
  team2: number;
}

type MatchStatus = 'pending' | 'live' | 'completed';

interface Match {
  id: string;
  team1?: Captain;
  team2?: Captain;
  status: MatchStatus;
  scores: {
    team1: number;
    team2: number;
  };
  round: number;
  matchNumber: number;
  isGrandFinals?: boolean;
  team1FromWinners?: boolean;
  team2FromWinners?: boolean;
  team1OriginalIndex?: number;
  team2OriginalIndex?: number;
  nextMatchId?: string;
  loserGoesToMatchId?: string;
}

interface BracketMatch {
  id: string;
  status: MatchStatus;
  scores: {
    team1: number;
    team2: number;
  };
}

// Add these interfaces to better type our bracket structure
interface WinnersBracketMatch extends Match {
  nextMatchId?: string;
  loserGoesToMatchId?: string;
}

interface LosersBracketMatch extends Match {
  nextMatchId?: string;
  winnerFromWinnersMatchId?: string;
}

// Add these interfaces to track progression
interface TeamProgression {
  teamId: string;
  sourceMatchId: string;
  targetMatchId: string;
  targetSlot: 'team1' | 'team2';
}

// Add this interface near the top with other interfaces
interface EditingScore {
  matchId: string;
  team: 'team1' | 'team2';
  currentValue: string;
}

// Update the StatusIndicator component
const StatusIndicator: React.FC<{ status: MatchStatus; hasTeams: boolean }> = ({ status, hasTeams }) => {
  if (!hasTeams) return null;

  switch (status) {
    case 'live':
      return (
        <span 
          className="animate-pulse px-1.5 py-0.5 text-[10px] font-bold bg-red-500/20 text-red-400 rounded-sm tracking-wide"
          title="Match in progress"
        >
          LIVE
        </span>
      );
    case 'completed':
      return (
        <span 
          className="px-1.5 py-0.5 text-[10px] font-bold bg-green-500/20 text-green-400 rounded-sm tracking-wide"
          title="Match completed"
        >
          COMPLETED
        </span>
      );
    default:
      return (
        <span 
          className="px-1.5 py-0.5 text-[10px] font-bold bg-zinc-500/20 text-zinc-400 rounded-sm tracking-wide"
          title="Match pending"
        >
          PENDING
        </span>
      );
  }
};

// Update the StatusControl component
const StatusControl: React.FC<{
  matchId: string;
  status: MatchStatus;
  hasTeams: boolean;
  onStatusChange: (matchId: string, newStatus: MatchStatus) => void;
}> = ({ matchId, status, hasTeams, onStatusChange }) => {
  if (!hasTeams) return null;

  return (
    <div className="absolute -right-24 top-1/2 -translate-y-1/2 z-50 opacity-0 group-hover:opacity-100 transition-opacity">
      <div className="flex flex-col gap-1 bg-zinc-800 rounded-md border border-zinc-700 p-1 shadow-lg">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onStatusChange(matchId, 'pending');
          }}
          className={`px-2 py-1 rounded-sm text-[10px] font-medium flex items-center gap-1.5
            ${status === 'pending' ? 'bg-zinc-700' : 'hover:bg-zinc-700/50'}`}
          title="Set as Pending"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
          PENDING
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onStatusChange(matchId, 'live');
          }}
          className={`px-2 py-1 rounded-sm text-[10px] font-medium flex items-center gap-1.5 text-red-400
            ${status === 'live' ? 'bg-zinc-700' : 'hover:bg-zinc-700/50'}`}
          title="Set as Live"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
          LIVE
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onStatusChange(matchId, 'completed');
          }}
          className={`px-2 py-1 rounded-sm text-[10px] font-medium flex items-center gap-1.5 text-green-400
            ${status === 'completed' ? 'bg-zinc-700' : 'hover:bg-zinc-700/50'}`}
          title="Set as Completed"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
          COMPLETED
        </button>
      </div>
    </div>
  );
};

const BracketMatch: React.FC<{
  match: Match;
  onStatusChange: (matchId: string, status: MatchStatus) => void;
  onScoresChange: (matchId: string, scores: { team1: number; team2: number }) => void;
  showTeamLogos?: boolean;
}> = ({ match, onStatusChange, onScoresChange, showTeamLogos }) => {
  const [editingScore, setEditingScore] = useState<'team1' | 'team2' | null>(null);
  const [tempScore, setTempScore] = useState<string>('');

  // Check if match has any teams
  const hasTeams = Boolean(match.team1 || match.team2);

  const handleScoreClick = (team: 'team1' | 'team2') => {
    if (match.status === 'pending') return; // Only allow score editing for live/completed matches
    setEditingScore(team);
    setTempScore(String(match.scores[team]));
  };

  const handleScoreChange = (value: string) => {
    // Only allow numbers 0-99
    if (/^\d{0,2}$/.test(value)) {
      setTempScore(value);
    }
  };

  const handleScoreSubmit = () => {
    if (editingScore) {
      const newScore = parseInt(tempScore) || 0;
      const newScores = {
        ...match.scores,
        [editingScore]: newScore
      };
      onScoresChange(match.id, newScores);
      setEditingScore(null);
    }
  };

  const getStatusIndicator = () => {
    switch (match.status) {
      case 'live':
        return (
          <span 
            className="animate-pulse px-1.5 py-0.5 text-[10px] font-bold bg-red-500/20 text-red-400 rounded-sm tracking-wide"
            title="Match in progress"
          >
            LIVE
          </span>
        );
      case 'completed':
        return (
          <span 
            className="px-1.5 py-0.5 text-[10px] font-bold bg-green-500/20 text-green-400 rounded-sm tracking-wide"
            title="Match completed"
          >
            COMPLETED
          </span>
        );
      default:
        return (
          <span 
            className="px-1.5 py-0.5 text-[10px] font-bold bg-zinc-500/20 text-zinc-400 rounded-sm tracking-wide"
            title="Match pending"
          >
            PENDING
          </span>
        );
    }
  };

  const ScoreDisplay: React.FC<{
    team: 'team1' | 'team2';
    isWinner: boolean;
  }> = ({ team, isWinner }) => (
    <div 
      onClick={() => handleScoreClick(team)}
      className="relative"
    >
      {editingScore === team ? (
        <Input
          type="text"
          value={tempScore}
          onChange={(e) => handleScoreChange(e.target.value)}
          onBlur={handleScoreSubmit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleScoreSubmit();
            if (e.key === 'Escape') setEditingScore(null);
          }}
          className="w-12 h-6 px-1 py-0 text-center bg-zinc-700/50 border-zinc-600"
          autoFocus
        />
      ) : (
        <span className={`
          text-sm font-medium px-2 py-0.5 rounded cursor-pointer
          hover:bg-zinc-700/70 transition-colors
          ${isWinner 
            ? 'bg-blue-500/20 text-blue-400' 
            : 'bg-zinc-700/50 text-zinc-400'}
        `}>
          {match.scores[team]}
        </span>
      )}
    </div>
  );

  const getTeamContainerClass = (team: 'team1' | 'team2') => {
    const isTeam1 = team === 'team1';
    const teamScore = match.scores[team];
    const otherTeamScore = match.scores[isTeam1 ? 'team2' : 'team1'];
    const isWinner = match.status === 'completed' && teamScore > otherTeamScore;
    const isLoser = match.status === 'completed' && teamScore < otherTeamScore;

    return `
      relative flex items-center h-12 w-[280px] 
      border border-zinc-700/50 rounded-md overflow-hidden
      transition-all duration-200
      ${match.status === 'live' ? 'border-blue-500/50 bg-zinc-800/90' : ''}
      ${isWinner ? 'border-l-4 border-l-green-500 bg-green-950/30' : ''}
      ${isLoser ? 'border-l-4 border-l-red-500 bg-red-950/30' : ''}
      ${!isWinner && !isLoser ? 'bg-zinc-800/90' : ''}
    `;
  };

  return (
    <div className="relative group">
      <div className="flex flex-col gap-1">
        {/* Team 1 */}
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`
            relative flex items-center h-12 w-[280px] 
            border border-zinc-700/50 rounded-md overflow-hidden
            transition-all duration-200
            ${match.status === 'live' ? 'border-blue-500/50 bg-zinc-800/90' : ''}
            ${match.status === 'completed' && match.scores.team1 > match.scores.team2 
              ? 'border-l-4 border-l-green-500 bg-green-950/30' 
              : match.status === 'completed' && match.scores.team1 < match.scores.team2 
                ? 'border-l-4 border-l-red-500 bg-red-950/30'
                : 'bg-zinc-800/90'
            }
            ${snapshot.isDragging ? 'shadow-lg scale-[1.02] z-50' : ''}
          `}
        >
          {showTeamLogos && match.team1 && (
            <div className="absolute inset-0 w-full h-full">
              <img 
                src={`https://picsum.photos/400/400?random=${match.team1.id}`}
                alt="Team Logo"
                className="w-full h-full object-cover opacity-10"
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  minWidth: '100%',
                  minHeight: '100%'
                }}
              />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-900/50 to-transparent" />
          <div className="relative flex items-center justify-between w-full px-3">
            <span className="text-sm text-zinc-200 font-medium truncate">
              {match.team1?.name || 'TBD'}
            </span>
            <div className="flex items-center gap-3">
              <StatusIndicator 
                status={match.status} 
                hasTeams={hasTeams}
              />
              <SharedScoreDisplay
                matchId={match.id}
                team="team1"
                isWinner={match.scores.team1 > match.scores.team2}
                score={match.scores.team1}
                status={match.status}
                editingScore={editingScore}
                onScoreClick={handleScoreClick}
                onScoreChange={handleScoreChange}
                onScoreSubmit={handleScoreSubmit}
                setEditingScore={setEditingScore}
              />
            </div>
          </div>
        </div>

        {/* Team 2 */}
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`
            relative flex items-center h-12 w-[280px] 
            border border-zinc-700/50 rounded-md overflow-hidden
            transition-all duration-200
            ${match.status === 'live' ? 'border-blue-500/50 bg-zinc-800/90' : ''}
            ${match.status === 'completed' && match.scores.team2 > match.scores.team1 
              ? 'border-l-4 border-l-green-500 bg-green-950/30' 
              : match.status === 'completed' && match.scores.team2 < match.scores.team1 
                ? 'border-l-4 border-l-red-500 bg-red-950/30'
                : 'bg-zinc-800/90'
            }
            ${snapshot.isDragging ? 'shadow-lg scale-[1.02] z-50' : ''}
          `}
        >
          {showTeamLogos && match.team2 && (
            <div className="absolute inset-0 w-full h-full">
              <img 
                src={`https://picsum.photos/400/400?random=${match.team2.id}`}
                alt="Team Logo"
                className="w-full h-full object-cover opacity-10"
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  minWidth: '100%',
                  minHeight: '100%'
                }}
              />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-900/50 to-transparent" />
          <div className="relative flex items-center justify-between w-full px-3">
            <span className="text-sm text-zinc-200 font-medium truncate">
              {match.team2?.name || 'TBD'}
            </span>
            <div className="flex items-center gap-3">
              <StatusIndicator 
                status={match.status} 
                hasTeams={hasTeams}
              />
              <SharedScoreDisplay
                matchId={match.id}
                team="team2"
                isWinner={match.scores.team2 > match.scores.team1}
                score={match.scores.team2}
                status={match.status}
                editingScore={editingScore}
                onScoreClick={handleScoreClick}
                onScoreChange={handleScoreChange}
                onScoreSubmit={handleScoreSubmit}
                setEditingScore={setEditingScore}
              />
            </div>
          </div>
        </div>
      </div>
      <StatusControl 
        matchId={match.id}
        status={match.status}
        hasTeams={hasTeams}
        onStatusChange={(matchId, status) => {
          setMatches(prev => prev.map(m => 
            m.id === matchId ? { ...m, status } : m
          ));
        }}
      />
      {/* Connector Lines */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-px bg-zinc-700/50" />
      <div className="absolute left-full top-1/2 -translate-y-1/2">
        <ChevronRight className="h-4 w-4 text-zinc-600 -translate-x-1" />
      </div>
    </div>
  );
};

// Add this helper function to determine the winner of a match
const getMatchWinner = (match: Match): Captain | undefined => {
  if (match.status !== 'completed') return undefined;
  if (match.scores.team1 > match.scores.team2) return match.team1;
  if (match.scores.team2 > match.scores.team1) return match.team2;
  return undefined;
};

// Add this helper function to determine the loser of a match
const getMatchLoser = (match: Match): Captain | undefined => {
  if (match.status !== 'completed') return undefined;
  if (match.scores.team1 < match.scores.team2) return match.team1;
  if (match.scores.team2 < match.scores.team1) return match.team2;
  return undefined;
};

// Add this helper component for the bracket indicator badge
const BracketBadge: React.FC<{ bracket: 'winners' | 'losers' }> = ({ bracket }) => (
  <span className={`
    px-1.5 py-0.5 text-[10px] font-bold rounded-sm tracking-wide
    ${bracket === 'winners' 
      ? 'bg-blue-500/20 text-blue-400' 
      : 'bg-orange-500/20 text-orange-400'
    }
  `}>
    {bracket === 'winners' ? 'WINNERS' : 'LOSERS'}
  </span>
);

// Update the team name display in BracketMatch component
const TeamDisplay: React.FC<{
  team?: Captain;
  teamNumber?: string;
  isGrandFinals?: boolean;
  isFromWinnersBracket?: boolean;
}> = ({ team, teamNumber, isGrandFinals, isFromWinnersBracket }) => (
  <div className="flex items-center gap-2 min-w-0">
    {teamNumber && (
      <span className="text-xs text-zinc-500 font-medium">
        #{teamNumber}
      </span>
    )}
    <span className="text-sm text-zinc-200 font-medium truncate">
      {team?.name || 'TBD'}
    </span>
    {isGrandFinals && team && (
      <BracketBadge bracket={isFromWinnersBracket ? 'winners' : 'losers'} />
    )}
  </div>
);

// Add this new component for the tournament winner display
const TournamentWinner: React.FC<{ winner?: Captain }> = ({ winner }) => {
  if (!winner) return null;

  return (
    <div className="absolute -right-96 top-1/2 -translate-y-1/2">
      <div className="relative flex flex-col items-center">
        <div className="absolute inset-0 bg-yellow-500/10 blur-2xl rounded-full" />
        <div className="mb-4">
          <Trophy className="h-16 w-16 text-yellow-500 animate-pulse" />
        </div>
        <div className={`
          relative flex items-center h-20 w-[320px]
          bg-gradient-to-r from-yellow-500/20 to-transparent
          border border-yellow-500/30 rounded-lg overflow-hidden
          shadow-[0_0_15px_rgba(234,179,8,0.3)]
        `}>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-yellow-500/10 via-transparent to-transparent" />
          <div className="relative flex items-center justify-between w-full px-6">
            <div className="flex items-center gap-4">
              <div className="flex flex-col">
                <span className="text-xs font-medium text-yellow-500/80 uppercase tracking-wider">
                  Tournament Winner
                </span>
                <span className="text-xl font-bold text-yellow-500">
                  {winner.name}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-center h-10 w-10 rounded-full bg-yellow-500/20">
              <Check className="h-5 w-5 text-yellow-500" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Add these helper functions to calculate bracket structure
const calculateBracketStructure = (numTeams: number) => {
  const roundsNeeded = Math.ceil(Math.log2(numTeams));
  
  // Winners bracket structure
  const winnersBracket = {
    rounds: roundsNeeded,
    matchesPerRound: Array.from({ length: roundsNeeded }, (_, i) => 
      Math.ceil(numTeams / Math.pow(2, i + 1))
    )
  };

  // Losers bracket structure
  // In double elimination, losers bracket has twice as many rounds minus 1
  const losersBracket = {
    rounds: (roundsNeeded - 1) * 2,
    matchesPerRound: [] as number[]
  };

  // Calculate matches for each losers round
  for (let i = 0; i < losersBracket.rounds; i++) {
    if (i % 2 === 0) {
      // Rounds where losers from winners bracket enter
      losersBracket.matchesPerRound[i] = Math.ceil(numTeams / Math.pow(2, Math.floor(i/2) + 2));
    } else {
      // Rounds where winners from previous losers round play
      losersBracket.matchesPerRound[i] = losersBracket.matchesPerRound[i - 1];
    }
  }

  return {
    winners: winnersBracket,
    losers: losersBracket,
    totalRounds: roundsNeeded
  };
};

// Update the getSeededOrder function
const getSeededOrder = (numTeams: number): number[] => {
  // Create pairs for horizontal reading (1v2, 3v4, 5v6, 7v8)
  const order = [];
  for (let i = 0; i < numTeams; i += 2) {
    // Add each pair in order
    order.push(i);     // First team of pair (1,3,5,7)
    if (i + 1 < numTeams) {
      order.push(i + 1); // Second team of pair (2,4,6,8)
    }
  }
  return order;
};

// Update the generateBracketMatches function to sort teams by their number and handle larger team sizes
const generateBracketMatches = (numTeams: number, teams: Captain[]): Match[] => {
  const matches: Match[] = [];
  const roundsNeeded = Math.ceil(Math.log2(numTeams));
  const firstRoundMatches = Math.ceil(numTeams / 2);

  // Sort teams by their number (assuming teams have a number property)
  const sortedTeams = [...teams].sort((a, b) => {
    const aNum = parseInt(a.name.match(/\d+/)?.[0] || '0');
    const bNum = parseInt(b.name.match(/\d+/)?.[0] || '0');
    return aNum - bNum;
  });

  // Generate Round 1 Matches with proper seeding
  for (let i = 0; i < firstRoundMatches; i++) {
    const team1Index = i * 2;
    const team2Index = i * 2 + 1;

    matches.push({
      id: `winner-match-1-${i}`,
      team1: team1Index < sortedTeams.length ? sortedTeams[team1Index] : undefined,
      team2: team2Index < sortedTeams.length ? sortedTeams[team2Index] : undefined,
      status: 'pending',
      scores: { team1: 0, team2: 0 },
      round: 1,
      matchNumber: i,
      nextMatchId: `winner-match-2-${Math.floor(i/2)}`,
      team1OriginalIndex: team1Index,
      team2OriginalIndex: team2Index
    });
  }

  // Generate subsequent rounds
  for (let round = 2; round <= roundsNeeded; round++) {
    const matchesInRound = Math.ceil(firstRoundMatches / Math.pow(2, round - 1));
    
    for (let match = 0; match < matchesInRound; match++) {
      matches.push({
        id: `winner-match-${round}-${match}`,
        team1: undefined,
        team2: undefined,
        status: 'pending',
        scores: { team1: 0, team2: 0 },
        round,
        matchNumber: match,
        nextMatchId: round === roundsNeeded ? 'finals' : `winner-match-${round + 1}-${Math.floor(match/2)}`,
      });
    }
  }

  // Add Finals Match
  matches.push({
    id: 'finals',
    team1: undefined,
    team2: undefined,
    status: 'pending',
    scores: { team1: 0, team2: 0 },
    round: roundsNeeded + 1,
    matchNumber: 0,
    isGrandFinals: true
  });

  return matches;
};

// Update the clearSubsequentMatches function
const clearSubsequentMatches = (matchId: string, matches: Match[]) => {
  const match = matches.find(m => m.id === matchId);
  if (!match) return matches;

  return matches.map(m => {
    // For winners bracket matches
    if (match.id.startsWith('winner-match')) {
      // Find the next match this team would have gone to
      const nextMatchId = `winner-match-${match.round + 1}-${Math.floor(match.matchNumber / 2)}`;
      const losersMatchId = `loser-match-${match.round}-${Math.floor(match.matchNumber / 2)}`;

      // Only clear if this is the direct next match or corresponding losers match
      if (m.id === nextMatchId || m.id === losersMatchId) {
        // If this is the next winners match, only clear the slot this team would have gone to
        if (m.id === nextMatchId) {
          const isFirstSlot = match.matchNumber % 2 === 0;
          return {
            ...m,
            team1: isFirstSlot ? undefined : m.team1,
            team2: isFirstSlot ? m.team2 : undefined,
            scores: { team1: 0, team2: 0 },
            status: 'pending' as MatchStatus
          };
        }
        // If this is the losers match, clear it entirely
        return {
          ...m,
          team1: undefined,
          team2: undefined,
          scores: { team1: 0, team2: 0 },
          status: 'pending' as MatchStatus
        };
      }
    }
    // For losers bracket matches
    else if (match.id.startsWith('loser-match')) {
      const nextMatchId = `loser-match-${match.round + 1}-${Math.floor(match.matchNumber / 2)}`;
      if (m.id === nextMatchId) {
        // Only clear the slot this team would have gone to
        const isFirstSlot = match.matchNumber % 2 === 0;
        return {
          ...m,
          team1: isFirstSlot ? undefined : m.team1,
          team2: isFirstSlot ? m.team2 : undefined,
          scores: { team1: 0, team2: 0 },
          status: 'pending' as MatchStatus
        };
      }
    }
    return m;
  });
};

// Update the handleDragEnd function
const handleDragEnd = (result: any) => {
  if (!result.destination) return;

  const sourceIndex = result.source.index;
  const destinationIndex = result.destination.index;
  
  const sourceMatchNum = Math.floor(sourceIndex / 2);
  const destMatchNum = Math.floor(destinationIndex / 2);
  const isSourceTeam1 = sourceIndex % 2 === 0;
  const isDestTeam1 = destinationIndex % 2 === 0;

  setMatches(prev => {
    const newMatches = [...prev];
    const round1Matches = newMatches.filter(m => m.id.startsWith('winner-match-1'));
    
    // Get source and destination matches
    const sourceMatch = round1Matches[sourceMatchNum];
    const destMatch = round1Matches[destMatchNum];
    
    if (!sourceMatch || !destMatch) return prev;

    // Get the teams we're swapping
    const sourceTeam = isSourceTeam1 ? sourceMatch.team1 : sourceMatch.team2;
    const destTeam = isDestTeam1 ? destMatch.team1 : destMatch.team2;

    if (!sourceTeam || !destTeam) return prev;

    // Calculate new team numbers based on sequential positions
    const sourceTeamNumber = sourceMatchNum * 2 + (isSourceTeam1 ? 1 : 2);
    const destTeamNumber = destMatchNum * 2 + (isDestTeam1 ? 1 : 2);

    // Update the teams array through the parent component
    const newTeams = [...teams];
    const sourceTeamIndex = sourceTeamNumber - 1;
    const destTeamIndex = destTeamNumber - 1;
    [newTeams[sourceTeamIndex], newTeams[destTeamIndex]] = [newTeams[destTeamIndex], newTeams[sourceTeamIndex]];
    onTeamsReorder?.(newTeams);

    // Update the matches with swapped teams
    newMatches.forEach(match => {
      if (match.id === sourceMatch.id) {
        if (isSourceTeam1) match.team1 = destTeam;
        else match.team2 = destTeam;
      }
      if (match.id === destMatch.id) {
        if (isDestTeam1) match.team1 = sourceTeam;
        else match.team2 = sourceTeam;
      }
    });

    return newMatches;
  });
};

// Add this shared component at the top level
const SharedScoreDisplay: React.FC<{
  matchId: string;
  team: 'team1' | 'team2';
  isWinner: boolean;
  score: number;
  status: MatchStatus;
  editingScore: EditingScore | null;
  onScoreClick: (matchId: string, team: 'team1' | 'team2', currentScore: number) => void;
  onScoreChange: (value: string) => void;
  onScoreSubmit: (matchId: string) => void;
  setEditingScore: (value: EditingScore | null) => void;
}> = ({ 
  matchId, 
  team, 
  isWinner, 
  score,
  status,
  editingScore,
  onScoreClick,
  onScoreChange,
  onScoreSubmit,
  setEditingScore
}) => {
  const isEditing = editingScore?.matchId === matchId && editingScore?.team === team;
  const canEdit = status === 'live';

  return isEditing ? (
    <input
      type="text"
      value={editingScore.currentValue}
      onChange={(e) => onScoreChange(e.target.value)}
      onBlur={() => onScoreSubmit(matchId)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') onScoreSubmit(matchId);
        if (e.key === 'Escape') setEditingScore(null);
      }}
      className="w-12 h-6 px-1 py-0 text-center bg-zinc-700/50 border border-zinc-600 rounded text-sm"
      autoFocus
    />
  ) : (
    <button
      onClick={() => canEdit && onScoreClick(matchId, team, score)}
      disabled={!canEdit}
      className={`
        text-sm font-medium px-2 py-0.5 rounded
        transition-colors
        ${!canEdit 
          ? 'cursor-default'
          : 'cursor-pointer hover:bg-zinc-700/70'
        }
        ${isWinner 
          ? 'bg-blue-500/20 text-blue-400' 
          : 'bg-zinc-700/50 text-zinc-400'}
        ${!canEdit && 'opacity-75'}
      `}
    >
      {score}
    </button>
  );
};

// Add these styles near the top of the file
const getDragStyle = (isDragging: boolean, draggableStyle: any) => ({
  ...draggableStyle,
  opacity: isDragging ? 0.8 : 1,
  transform: isDragging ? `${draggableStyle.transform} scale(1.02)` : draggableStyle.transform,
  boxShadow: isDragging ? '0 10px 25px -5px rgba(0, 0, 0, 0.5)' : 'none',
  zIndex: isDragging ? 9999 : 1,
});

// Update the DebugInfo component to show original team indices
const DebugInfo: React.FC<{
  matchId: string;
  team: 'team1' | 'team2';
  round: number;
  matchNumber: number;
  originalIndex?: number;
}> = ({ matchId, team, round, matchNumber, originalIndex }) => {
  if (process.env.NODE_ENV === 'production') return null;

  return (
    <div className="absolute right-0 top-0 -translate-y-full flex items-center gap-1 text-[9px] font-mono opacity-50 hover:opacity-100 transition-opacity">
      <span className="px-1 py-0.5 bg-zinc-800 rounded">
        Match: {matchId}
      </span>
      <span className="px-1 py-0.5 bg-zinc-800 rounded">
        Round: {round}
      </span>
      <span className="px-1 py-0.5 bg-zinc-800 rounded">
        Slot: {matchNumber}-{team}
      </span>
      {originalIndex !== undefined && (
        <span className="px-1 py-0.5 bg-blue-900/50 rounded">
          Seed: {originalIndex + 1}
        </span>
      )}
    </div>
  );
};

// Add type guard for team1 and team2 properties
const getTeamIndex = (team: Captain | undefined, teams: Captain[]) => {
  if (!team) return -1;
  return teams.findIndex(t => t.id === team.id);
};

// Update the handleMatchStatusChange function to properly handle finals progression
const handleMatchStatusChange = (matchId: string, newStatus: MatchStatus) => {
  setMatches(prev => {
    const newMatches = [...prev];
    const matchIndex = newMatches.findIndex(m => m.id === matchId);
    if (matchIndex === -1) return prev;

    const match = newMatches[matchIndex];
    
    // If we're setting to completed and it wasn't completed before
    if (newStatus === 'completed' && match.status !== 'completed') {
      // Determine winner
      const winner = match.scores.team1 > match.scores.team2 ? match.team1 : match.team2;

      if (winner && match.nextMatchId) {
        // Find the next match
        const nextMatchIndex = newMatches.findIndex(m => m.id === match.nextMatchId);
        
        if (nextMatchIndex !== -1) {
          const nextMatch = newMatches[nextMatchIndex];
          
          if (match.round === 1) {
            // For Round 1, matches 0 and 1 go to first Round 2 match
            // matches 2 and 3 go to second Round 2 match, etc.
            const isFirstTeam = Math.floor(match.matchNumber / 2) * 2 === match.matchNumber;
            
            newMatches[nextMatchIndex] = {
              ...nextMatch,
              [isFirstTeam ? 'team1' : 'team2']: winner,
              scores: {
                ...nextMatch.scores,
                [isFirstTeam ? 'team1' : 'team2']: 0
              }
            };
          } else if (match.round === 2) {
            // For Round 2, first completed match goes to team1 of finals
            // second completed match goes to team2 of finals
            const completedRound2Matches = newMatches
              .filter(m => m.round === 2 && m.status === 'completed')
              .length;

            newMatches[nextMatchIndex] = {
              ...nextMatch,
              [completedRound2Matches === 0 ? 'team1' : 'team2']: winner,
              scores: {
                ...nextMatch.scores,
                [completedRound2Matches === 0 ? 'team1' : 'team2']: 0
              }
            };
          }
        }
      }
    }

    // Update the current match status
    newMatches[matchIndex] = {
      ...match,
      status: newStatus
    };

    return newMatches;
  });
};

// Update the handleScoreSubmit function to handle finals winner
const handleScoreSubmit = (matchId: string) => {
  if (!editingScore || editingScore.matchId !== matchId) return;

  const newScore = parseInt(editingScore.currentValue) || 0;
  const match = matches.find(m => m.id === matchId);
  if (!match) return;

  const newScores = {
    ...match.scores,
    [editingScore.team]: newScore
  };

  setMatches(prev => {
    const updated = prev.map(m => 
      m.id === matchId ? { ...m, scores: newScores } : m
    );

    // Check if this is the finals match and it's completed
    const finalsMatch = updated.find(m => m.id === 'finals');
    if (finalsMatch?.status === 'completed') {
      const winner = finalsMatch.scores.team1 > finalsMatch.scores.team2 
        ? finalsMatch.team1 
        : finalsMatch.team2;
      setTournamentWinner(winner);
    }

    return updated;
  });
  
  setEditingScore(null);
};

// Add this new component for bracket lines
const BracketConnector: React.FC<{
  isTop: boolean;
  isWinner?: boolean;
}> = ({ isTop, isWinner }) => (
  <div className="absolute right-0 flex items-center">
    <div className="w-8 h-px bg-zinc-700/50" />
    <div className={`
      w-px h-[${isTop ? '64px' : '0px'}] 
      ${isTop ? '-translate-y-1/2' : 'translate-y-1/2'}
      bg-zinc-700/50
    `} />
  </div>
);

// Update the TeamBox component to display dynamic team numbers
const TeamBox: React.FC<{
  team?: Captain;
  score: number;
  status: MatchStatus;
  matchId: string;
  teamType: 'team1' | 'team2';
  isWinner: boolean;
  showTeamLogos: boolean;
  originalIndex?: number;
  editingScore: EditingScore | null;
  onScoreClick: (matchId: string, team: 'team1' | 'team2', currentScore: number) => void;
  onScoreChange: (value: string) => void;
  onScoreSubmit: (matchId: string) => void;
  setEditingScore: (value: EditingScore | null) => void;
  isBye?: boolean;
}> = ({
  team,
  score,
  status,
  matchId,
  teamType,
  isWinner,
  showTeamLogos,
  originalIndex,
  editingScore,
  onScoreClick,
  onScoreChange,
  onScoreSubmit,
  setEditingScore,
  isBye = false
}) => (
  <div className={`
    relative flex items-center h-12 w-[280px] 
    border border-zinc-700/50 rounded-md overflow-hidden
    transition-all duration-200
    ${status === 'live' ? 'border-blue-500/50' : ''}
    ${status === 'completed' && isWinner 
      ? 'border-l-4 border-l-green-500 bg-green-950/30' 
      : status === 'completed' && !isWinner 
        ? 'border-l-4 border-l-red-500 bg-red-950/30'
        : 'bg-zinc-800/90'
    }
    ${isBye ? 'opacity-50' : ''}
  `}>
    {/* Team Logo Background */}
    {showTeamLogos && team && !isBye && (
      <div className="absolute inset-0 w-full h-full">
        <img 
          src={`https://picsum.photos/400/400?random=${team.id}`}
          alt={`${team.name} Logo`}
          className="w-full h-full object-cover opacity-10"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            minWidth: '100%',
            minHeight: '100%'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-900/50 to-transparent" />
      </div>
    )}
    
    {/* Team Content */}
    <div className="relative flex items-center justify-between w-full px-3">
      <div className="flex items-center gap-2">
        {originalIndex !== undefined && !isBye && (
          <span className="text-xs text-zinc-500 font-medium">
            #{originalIndex + 1}
          </span>
        )}
        <span className={`text-sm font-medium truncate ${isBye ? 'text-zinc-500 italic' : 'text-zinc-200'}`}>
          {team?.name || 'TBD'}
        </span>
      </div>
      <div className="flex items-center gap-3">
        {!isBye && (
          <>
            <StatusIndicator 
              status={status} 
              hasTeams={Boolean(team)}
            />
            <SharedScoreDisplay
              matchId={matchId}
              team={teamType}
              isWinner={isWinner}
              score={score}
              status={status}
              editingScore={editingScore}
              onScoreClick={onScoreClick}
              onScoreChange={onScoreChange}
              onScoreSubmit={onScoreSubmit}
              setEditingScore={setEditingScore}
            />
          </>
        )}
      </div>
    </div>
  </div>
);

// Update these helper functions for proper bracket generation
const calculateFirstRoundMatches = (numTeams: number) => {
  return {
    numMatches: Math.ceil(numTeams / 2), // Number of matches needed for first round
    numByes: 0,
    nextPowerOf2: Math.pow(2, Math.ceil(Math.log2(numTeams)))
  };
};

// Update the generateSeeding function to preserve original team numbers
const generateSeeding = (numTeams: number): number[] => {
  // Create array of pairs [index, seed]
  const pairs = Array.from({ length: numTeams }, (_, i) => ({
    index: i,
    seed: i + 1 // Keep original team number (1-based)
  }));

  const seededOrder: number[] = [];
  let left = 0;
  let right = pairs.length - 1;

  // Keep adding teams until we've used them all
  while (left <= right) {
    // Add the current highest seed
    seededOrder.push(pairs[left].index);
    
    // If there's still a team to pair it with, add the lowest remaining seed
    if (left < right) {
      seededOrder.push(pairs[right].index);
    }
    
    left++;
    right--;
  }

  return seededOrder;
};

// Update the generateBrackets function
const generateBrackets = () => {
  const seeding = generateSeeding(numTeams);
  const numMatches = Math.ceil(numTeams / 2);
  
  const newMatches = Array.from({ length: numMatches }, (_, i) => {
    const firstTeamIndex = i * 2;
    const secondTeamIndex = i * 2 + 1;
    
    // Get the actual teams using the seeding array
    const team1 = seeding[firstTeamIndex] !== undefined ? teams[seeding[firstTeamIndex]] : undefined;
    const team2 = seeding[secondTeamIndex] !== undefined ? teams[seeding[secondTeamIndex]] : undefined;
    
    return {
      id: `round-1-match-${i}`,
      team1,
      team2,
      status: 'pending',
      scores: { team1: 0, team2: 0 },
      round: 1,
      matchNumber: i,
      // Store the original team numbers (1-based)
      team1OriginalIndex: seeding[firstTeamIndex] !== undefined ? seeding[firstTeamIndex] : undefined,
      team2OriginalIndex: seeding[secondTeamIndex] !== undefined ? seeding[secondTeamIndex] : undefined,
      isBye: secondTeamIndex >= seeding.length
    };
  });

  setMatches(newMatches);
  setIsGenerated(true);
};

// Update the BracketsSection component
const BracketsSection: React.FC<BracketsSectionProps> = ({
  mode,
  teams,
  numTeams,
  teamSize,
  showTeamLogos = false,
  onTeamsReorder
}) => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [editingScore, setEditingScore] = useState<EditingScore | null>(null);
  const [isGenerated, setIsGenerated] = useState(false);

  const generateBrackets = () => {
    const seeding = generateSeeding(numTeams);
    const numMatches = Math.ceil(numTeams / 2);
    
    const newMatches = Array.from({ length: numMatches }, (_, i) => {
      const firstTeamIndex = i * 2;
      const secondTeamIndex = i * 2 + 1;
      
      // Get the actual teams using the seeding array
      const team1 = seeding[firstTeamIndex] !== undefined ? teams[seeding[firstTeamIndex]] : undefined;
      const team2 = seeding[secondTeamIndex] !== undefined ? teams[seeding[secondTeamIndex]] : undefined;
      
      return {
        id: `round-1-match-${i}`,
        team1,
        team2,
        status: 'pending',
        scores: { team1: 0, team2: 0 },
        round: 1,
        matchNumber: i,
        // Store the original team numbers (1-based)
        team1OriginalIndex: seeding[firstTeamIndex] !== undefined ? seeding[firstTeamIndex] : undefined,
        team2OriginalIndex: seeding[secondTeamIndex] !== undefined ? seeding[secondTeamIndex] : undefined,
        isBye: secondTeamIndex >= seeding.length
      };
    });

    setMatches(newMatches);
    setIsGenerated(true);
  };

  // Score handling functions
  const handleScoreClick = (matchId: string, team: 'team1' | 'team2', currentScore: number) => {
    setEditingScore({
      matchId,
      team,
      currentValue: currentScore.toString()
    });
  };

  const handleScoreChange = (value: string) => {
    if (!editingScore) return;
    if (/^\d{0,2}$/.test(value)) {
      setEditingScore({
        ...editingScore,
        currentValue: value
      });
    }
  };

  const handleScoreSubmit = (matchId: string) => {
    if (!editingScore || editingScore.matchId !== matchId) return;

    const newScore = parseInt(editingScore.currentValue) || 0;
    setMatches(prev => prev.map(match => 
      match.id === matchId 
        ? { 
            ...match, 
            scores: { 
              ...match.scores, 
              [editingScore.team]: newScore 
            } 
          }
        : match
    ));
    
    setEditingScore(null);
  };

  const handleStatusChange = (matchId: string, newStatus: MatchStatus) => {
    setMatches(prev => prev.map(match =>
      match.id === matchId ? { ...match, status: newStatus } : match
    ));
  };

  if (mode !== 'tournament') return null;

  const isReadyForBrackets = teams.every(team => team.players.length === teamSize);

  // Update the render logic to handle byes
  const renderMatch = (match: Match) => {
    const isBye = !match.team2;
    
    return (
      <div key={match.id} className="flex flex-col gap-2">
        {/* Team 1 */}
        <TeamBox
          team={match.team1}
          score={match.scores.team1}
          status={isBye ? 'completed' : match.status}
          matchId={match.id}
          teamType="team1"
          isWinner={isBye || match.scores.team1 > match.scores.team2}
          showTeamLogos={showTeamLogos}
          originalIndex={match.team1OriginalIndex}
          editingScore={editingScore}
          onScoreClick={handleScoreClick}
          onScoreChange={handleScoreChange}
          onScoreSubmit={handleScoreSubmit}
          setEditingScore={setEditingScore}
        />
        
        {/* Team 2 - Show BYE placeholder if it's a bye */}
        <TeamBox
          team={match.team2 || { 
            id: `bye-${match.id}`,
            name: 'BYE',
            players: [],
            captain: null,
            mmr: 0,
            rank: 'Unranked'
          }}
          score={match.scores.team2}
          status={isBye ? 'completed' : match.status}
          matchId={match.id}
          teamType="team2"
          isWinner={false} // BYE never wins
          showTeamLogos={showTeamLogos}
          originalIndex={match.team2OriginalIndex}
          editingScore={editingScore}
          onScoreClick={handleScoreClick}
          onScoreChange={handleScoreChange}
          onScoreSubmit={handleScoreSubmit}
          setEditingScore={setEditingScore}
          isBye={isBye}
        />

        {/* Status control */}
        <StatusControl
          matchId={match.id}
          status={isBye ? 'completed' : match.status}
          hasTeams={Boolean(match.team1)}
          onStatusChange={handleStatusChange}
        />
      </div>
    );
  };

  // Update the return JSX
  return (
    <Card className="bg-zinc-800/50 border-zinc-700 p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-md bg-yellow-500/10">
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

      {!isReadyForBrackets ? (
        <div className="flex flex-col items-center justify-center py-12 px-4">
          <Users className="h-12 w-12 text-zinc-700 mb-4" />
          <h3 className="text-lg font-medium text-zinc-300 mb-2">
            Waiting for Teams
          </h3>
          <p className="text-sm text-zinc-500 text-center max-w-md">
            Complete all team rosters to generate the tournament brackets
          </p>
        </div>
      ) : !isGenerated ? (
        <div className="flex flex-col items-center justify-center py-12 px-4">
          <div className="p-3 rounded-lg bg-yellow-500/10 mb-4">
            <Trophy className="h-8 w-8 text-yellow-500" />
          </div>
          <h3 className="text-lg font-medium text-zinc-300 mb-2">
            Ready to Start Tournament
          </h3>
          <p className="text-sm text-zinc-500 text-center max-w-md mb-6">
            {numTeams} teams are ready to compete. Generate the brackets to begin the tournament.
          </p>
          <button
            onClick={generateBrackets}
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-yellow-500 hover:bg-yellow-400 
              text-yellow-950 font-medium transition-colors"
          >
            <Trophy className="h-4 w-4" />
            Generate Brackets
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {matches.map(renderMatch)}
        </div>
      )}
    </Card>
  );
};

export default BracketsSection; 