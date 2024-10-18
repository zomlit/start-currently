import React, { useEffect, useState } from "react";
import {
  Trophy,
  Users,
  Wifi,
  WifiOff,
  ChevronRight,
  Crown,
} from "lucide-react";
import { useUser } from "@clerk/tanstack-start";
import { Container } from "@/components/layout/Container";
import DashboardHeader from "@/components/DashboardHeader";
import { Spinner } from "@/components/ui/spinner";
import { RANK_ORDER, sortPlayersByRank } from "@/utils/rankUtils";
import { useSupabase } from "@/hooks/useSupabase";

interface BracketState {
  bracket: any[];
  players: any[];
  captains: any[];
  teamSize: number;
  numCaptains: number;
  losersBracket: any[];
  selectedGameMode: string;
  showLosersBracket: boolean;
  isOnlineMode: boolean;
}

interface BracketData {
  id: string;
  user_id: string;
  name: string;
  data: BracketState;
  created_at: string;
  updated_at: string;
  owner_id: string;
  assigned_users: any[];
  is_complete: boolean;
}

interface SharedTeamPickerProps {
  bracketId: string;
}

const SharedTeamPicker: React.FC<SharedTeamPickerProps> = ({ bracketId }) => {
  const [state, setState] = useState<BracketState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isLoaded } = useUser();
  const supabase = useSupabase();

  const fetchBracketData = async () => {
    if (bracketId) {
      try {
        const { data, error } = await supabase
          .from("Bracket")
          .select("*")
          .eq("id", bracketId)
          .single();

        if (error) throw error;

        if (data && data.data) {
          setState(data.data);
        } else {
          setError("No state data found in the response");
        }
      } catch (error) {
        console.error("Error fetching bracket data:", error);
        setError("Error fetching bracket data");
      } finally {
        setLoading(false);
      }
    } else {
      console.error("No bracketId available");
      setError("No bracket ID available");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBracketData();

    // Set up real-time subscription
    const subscription = supabase
      .channel(`public:Bracket:id=eq.${bracketId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "Bracket",
          filter: `id=eq.${bracketId}`,
        },
        (payload) => {
          console.log("Change received!", payload);
          if (payload.new && payload.new.data) {
            setState(payload.new.data);
          }
        }
      )
      .subscribe();

    // Cleanup subscription on component unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [bracketId, supabase]);

  const renderSettings = () => (
    <div className="mb-8 rounded-lg border border-zinc-700 bg-zinc-800/50 p-6">
      <h2 className={`mb-4 text-2xl font-bold text-white`}>Settings</h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center space-x-2">
          <Users className="text-zinc-400" size={20} />
          <span>Team Size: {state?.teamSize}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Users className="text-zinc-400" size={20} />
          <span>Number of Captains: {state?.numCaptains}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Trophy className="text-zinc-400" size={20} />
          <span>Game Mode: {state?.selectedGameMode}</span>
        </div>
        <div className="flex items-center space-x-2">
          {state?.isOnlineMode ? (
            <Wifi className="text-zinc-400" size={20} />
          ) : (
            <WifiOff className="text-zinc-400" size={20} />
          )}
          <span>Mode: {state?.isOnlineMode ? "Online" : "Offline"}</span>
        </div>
      </div>
    </div>
  );

  const renderTeamsAndPlayers = () => {
    if (!state) return null;

    // Create a set of player IDs who are already in teams
    const assignedPlayerIds = new Set(
      state.captains?.flatMap((captain) =>
        captain.players?.map((player) => player.id)
      ) || []
    );

    // Filter out players who are already in teams
    const availablePlayers =
      state.players?.filter((player) => !assignedPlayerIds.has(player.id)) ||
      [];

    const sortedPlayers = sortPlayersByRank(availablePlayers);

    return (
      <div className="mb-8 flex rounded-lg border border-zinc-700 bg-zinc-800/50">
        <div className="w-1/4 border-r border-zinc-700 p-4">
          <h2 className="mb-4 text-xl font-bold text-white">
            Available Players
          </h2>
          <div
            className="space-y-2 overflow-y-auto"
            style={{ maxHeight: "calc(100vh - 300px)" }}
          >
            {sortedPlayers.map((player) => (
              <div
                key={player.id}
                className="flex items-center space-x-2 rounded-lg bg-zinc-700/50 p-2"
              >
                <img
                  src={player.iconUrl}
                  alt={player.rank}
                  className="h-6 w-6"
                />
                <span>{player.name}</span>
                <span className="text-sm text-zinc-400">
                  ({player.abbreviatedRank})
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex-1 p-6">
          <h2 className="mb-4 text-2xl font-bold text-white">Teams</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {state.captains?.map((captain, index) => (
              <div key={captain.id} className="rounded-lg bg-zinc-700/50 p-4">
                <h3 className="mb-2 text-xl font-bold text-white">
                  <span className="mr-2 inline-block w-8 text-center text-zinc-400">
                    {String(index + 1).padStart(2, "0")}.
                  </span>
                  {captain.name}
                </h3>
                <ul>
                  {captain.players?.map((player, playerIndex) => (
                    <li
                      key={player.id}
                      className="mb-1 flex items-center space-x-2"
                    >
                      <img
                        src={player.iconUrl}
                        alt={player.rank}
                        className="h-6 w-6"
                      />
                      <span>{player.name}</span>
                      {playerIndex === 0 && (
                        <span className="text-yellow-400">(Captain)</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderBracketRound = (round, roundIndex, isLosersBracket = false) => (
    <div key={roundIndex} className="flex flex-col">
      <div className={`mb-4 text-center text-sm font-semibold text-zinc-400`}>
        {isLosersBracket
          ? `Losers Round ${roundIndex + 1}`
          : roundIndex === 0
            ? "Round 1"
            : roundIndex === state?.bracket.length - 1
              ? "Final"
              : `Round ${roundIndex + 1}`}
      </div>
      <div
        className={`flex flex-col space-y-6 ${roundIndex > 0 ? "h-full justify-around" : ""}`}
      >
        {round.map((match, matchIndex) => (
          <div
            key={`${roundIndex}-${matchIndex}`}
            className={`relative ${roundIndex > 0 ? "my-4" : ""}`}
            style={{
              marginTop:
                roundIndex > 0 ? `${Math.pow(2, roundIndex) * 3 - 3}rem` : "0",
            }}
          >
            <div className="w-72 rounded-lg border border-zinc-700 bg-zinc-800 p-4 shadow-lg">
              {[match.team1, match.team2].map((team, teamIndex) => (
                <div
                  key={`${roundIndex}-${matchIndex}-${teamIndex + 1}`}
                  className={`mb-2 flex items-center rounded p-2 ${
                    match.winner
                      ? match.winner === team
                        ? "bg-green-900/50 font-bold"
                        : "bg-red-900/50"
                      : teamIndex === 0
                        ? "bg-blue-900/40"
                        : "bg-orange-900/40"
                  }`}
                >
                  <div className="w-6 flex-shrink-0">
                    {match.winner === team && team?.name && !team?.isBye && (
                      <Crown className="h-4 w-4 text-yellow-400" />
                    )}
                  </div>
                  <div
                    className={`flex-grow truncate text-zinc-200 ${team?.disqualified ? "line-through" : ""}`}
                  >
                    {team?.isBye ? "BYE" : team?.name || "TBD"}
                  </div>
                  <div className="w-8 text-right">
                    <span className="m-0 rounded bg-zinc-700/50 px-2 py-1 text-sm text-zinc-300">
                      {team?.isBye ? "-" : team?.score || "0"}
                    </span>
                  </div>
                  {team?.disqualified && (
                    <span className="ml-2 rounded bg-red-600 px-2 py-1 text-xs text-white">
                      DQ
                    </span>
                  )}
                </div>
              ))}
            </div>
            {roundIndex <
              (isLosersBracket
                ? state?.losersBracket.length
                : state?.bracket.length) -
                1 && (
              <div className="absolute -right-5 top-1/2 -translate-y-1/2 transform">
                <ChevronRight className="text-zinc-500" size={20} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderBracket = () => (
    <div className="mb-8 overflow-x-auto rounded-lg border border-zinc-700 bg-zinc-800/50 p-6">
      <h2 className={`mb-4 text-2xl font-bold text-white`}>
        Tournament Bracket
      </h2>
      <div className="flex space-x-8">
        {state?.bracket.map((round, roundIndex) =>
          renderBracketRound(round, roundIndex)
        )}
      </div>
    </div>
  );

  const renderLosersBracket = () => (
    <div className="mb-8 overflow-x-auto rounded-lg border border-zinc-700 bg-zinc-800/50 p-6">
      <h2 className={`mb-4 text-2xl font-bold text-white`}>Losers Bracket</h2>
      <div className="flex space-x-8">
        {state?.losersBracket.map((round, roundIndex) =>
          renderBracketRound(round, roundIndex, true)
        )}
      </div>
    </div>
  );

  return (
    <Container maxWidth="full">
      {!isLoaded && <Spinner />}

      <DashboardHeader
        category="Tournaments"
        title="Team Picker (Shared)"
        description=""
        keyModalText=""
        buttonUrl={``}
        buttonText=""
        backText=""
      />
      {loading ? (
        <Spinner className="w-8 fill-violet-300 text-white" />
      ) : error ? (
        <div>Error: {error}</div>
      ) : state ? (
        <>
          {renderSettings()}
          {renderTeamsAndPlayers()}
          {state.bracket && state.bracket.length > 0 && renderBracket()}
          {state.showLosersBracket &&
            state.losersBracket &&
            state.losersBracket.length > 0 &&
            renderLosersBracket()}
        </>
      ) : (
        <div>No team picker data available.</div>
      )}
    </Container>
  );
};

export default SharedTeamPicker;
