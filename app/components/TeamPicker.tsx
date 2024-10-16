import React, {
  useState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { useUser } from "@clerk/tanstack-start";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogClose,
} from "../components/ui/dialog";
import { Switch } from "../components/ui/switch";
import { Label } from "../components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../components/ui/tooltip";
import {
  Trash2,
  X,
  Users,
  Trophy,
  ChevronRight,
  ChevronDown,
  Settings,
  Database,
  Wifi,
  WifiOff,
  Shuffle,
  Crown,
  ChevronUp,
  Share,
  ExternalLink,
} from "lucide-react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { ScrollArea } from "../components/ui/scroll-area";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import {
  ROCKET_LEAGUE_RANKS,
  RANK_IMAGES,
  RANK_ORDER,
  getFullRankName,
  getRankColor,
  abbreviateRank,
  sortPlayersByRank,
} from "../utils/rankUtils";
import {
  createBrackets,
  updateWinnersBracket,
  updateLosersBracket,
  findNextOpenSlotInLosersBracket,
} from "../utils/bracketUtils";
import { useNavigate, useRouter } from "@tanstack/react-router";

import DashboardHeader from "./DashboardHeader";
import BackgroundImage from "./ui/background-image";
import Container from "./layout/Container";
import { Spinner } from "./ui/spinner";
import { useUpdateState } from "../hooks/useUpdateState";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { useSupabase } from "../hooks/useSupabase";
import { toast } from "../utils/toast";

const RankSelect = ({ value, onChange, color, iconUrl }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Update this function to correctly display the abbreviated rank
  const displayRank = (rank) => {
    if (!rank) return "Unknown"; // Handle undefined or null rank
    if (rank.startsWith("GC")) {
      return rank; // Already abbreviated correctly
    }
    if (rank.startsWith("Grand Champion")) {
      const division = rank.split(" ")[2];
      return `GC${division}`;
    }
    return rank.split(" ")[0]; // For other ranks, just show the first part
  };

  const selectedRank = ROCKET_LEAGUE_RANKS.find(
    (rank) => rank.name === value
  ) || {
    name: value,
    iconUrl: RANK_IMAGES[value],
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-20 items-center justify-between px-2 py-1 text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        style={{
          backgroundColor: "rgba(0, 0, 0, 0)",
          borderLeft: `1px solid ${color}`,
        }}
      >
        <div className="flex items-center">
          <img
            src={iconUrl || selectedRank.iconUrl}
            alt={value}
            className="mr-1 h-4 w-4"
          />
          <span className="text-zinc-100">{displayRank(value)}</span>
        </div>
        <ChevronDown className="h-4 w-4 text-zinc-400" />
      </button>
      {isOpen && (
        <div className="absolute right-0 z-10 mt-1 max-h-60 w-32 overflow-y-auto rounded-md border border-zinc-700 bg-zinc-800 shadow-lg">
          {ROCKET_LEAGUE_RANKS.map((rank) => (
            <button
              key={rank.name}
              onClick={() => {
                onChange(rank.name);
                setIsOpen(false);
              }}
              className="flex w-full items-center px-2 py-1 text-left text-sm text-zinc-100 hover:bg-zinc-700"
            >
              <img
                src={rank.iconUrl}
                alt={rank.name}
                className="mr-2 h-4 w-4"
              />
              <span>{rank.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

interface TeamPickerProps {
  initialBracketId?: string;
  isStandalone?: boolean;
}

const TeamPicker: React.FC<TeamPickerProps> = ({
  initialBracketId,
  isStandalone = false,
}) => {
  const supabase = useSupabase();
  const { user, isLoaded } = useUser();
  const queryClient = useQueryClient();
  const [captains, setCaptains] = useState([]);
  const [teamSize, setTeamSize] = useState(3);
  const [bracket, setBracket] = useState([]);
  const [numCaptains, setNumCaptains] = useState(8);
  const [showLosersBracket, setShowLosersBracket] = useState(false);
  const [losersBracket, setLosersBracket] = useState([]);
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [editingTeam, setEditingTeam] = useState(null);
  const [isOnlineMode, setIsOnlineMode] = useState(true);
  const [selectedGameMode, setSelectedGameMode] =
    useState("Ranked Doubles 2v2");
  const [reorderingTeam, setReorderingTeam] = useState(null);
  const [reorderingValue, setReorderingValue] = useState("");
  const [bracketId, setBracketId] = useState<string | null>(
    initialBracketId || null
  );
  const [newName, setNewName] = useState("");
  const [trashOpen, setTrashOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [scoreDialogOpen, setScoreDialogOpen] = useState(false);
  const [team1Score, setTeam1Score] = useState("");
  const [team2Score, setTeam2Score] = useState("");
  const [scoreUpdateInfo, setScoreUpdateInfo] = useState(null);
  const [selectedBracketId, setSelectedBracketId] = useState<string | null>(
    initialBracketId || null
  );
  const [tournamentName, setTournamentName] = useState("");
  const [tournamentCreated, setTournamentCreated] = useState(false);

  const { data: brackets, isLoading: isBracketsLoading } = useQuery({
    queryKey: ["brackets", user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error("User ID is not available");
      const response = await fetch(
        `http://localhost:9001/brackets?user_id=${user.id}`
      );
      if (!response.ok) throw new Error("Failed to fetch brackets");
      return response.json();
    },
    enabled: !!user?.id,
  });

  const [players, setPlayers] = useState([]);

  const router = useRouter();

  const handleOpenTournament = (id: string) => {
    window.open(`/teampicker/${id}`, "_blank");
  };

  const handleBracketSelect = async (bracketId: string) => {
    setSelectedBracketId(bracketId);
    if (bracketId) {
      try {
        const response = await fetch(
          `http://localhost:9001/brackets/${bracketId}?user_id=${user?.id}`
        );
        if (!response.ok) throw new Error("Failed to fetch bracket");
        const data = await response.json();

        if (data) {
          setBracketId(data.id);
          setTournamentName(data.name);
          setTeamSize(data.data.teamSize || 3);
          setBracket(data.data.bracket || []);
          setNumCaptains(data.data.numCaptains || 8);
          setShowLosersBracket(data.data.showLosersBracket || false);
          setLosersBracket(data.data.losersBracket || []);
          setSelectedGameMode(
            data.data.selectedGameMode || "Ranked Doubles 2v2"
          );

          // Handle captains and players
          const allPlayers = data.data.players || [];
          const tournamentCaptains = data.data.captains || [];

          // Set captains
          setCaptains(tournamentCaptains);

          // Identify players who are not captains
          const captainIds = new Set(
            tournamentCaptains.flatMap((captain) =>
              captain.players.map((player) => player.id)
            )
          );
          const availablePlayers = allPlayers.filter(
            (player) => !captainIds.has(player.id)
          );

          // Set available players
          setPlayers(availablePlayers);

          setTournamentCreated(true);
          console.log("Loaded captains:", tournamentCaptains);
          console.log("Loaded available players:", availablePlayers);
        } else {
          throw new Error("No data found for this bracket");
        }
      } catch (error) {
        console.error("Error loading bracket data:", error);
        toast.error({ title: "Failed to load tournament data" });
      }
    } else {
      resetState();
    }
  };

  // Add this helper function to reset the state
  const resetState = () => {
    setTournamentName("");
    setCaptains([]);
    setTeamSize(3);
    setBracket([]);
    setNumCaptains(8);
    setShowLosersBracket(false);
    setLosersBracket([]);
    setSelectedGameMode("Ranked Doubles 2v2");
    setPlayers([]);
    setTournamentCreated(false);
    setBracketId(null);
  };

  const deleteBracket = async (bracketId: string) => {
    if (window.confirm("Are you sure you want to delete this tournament?")) {
      try {
        const response = await fetch(
          `http://localhost:9001/brackets/${bracketId}`,
          {
            method: "DELETE",
          }
        );
        if (!response.ok) throw new Error("Failed to delete bracket");

        // Remove the deleted bracket from the cache
        queryClient.setQueryData(
          ["brackets", user?.id],
          (old: any[] | undefined) => {
            if (!old) return [];
            const updatedBrackets = old.filter(
              (bracket: any) => bracket.id !== bracketId
            );

            // Select the next available tournament or null if none left
            const nextBracket =
              updatedBrackets.length > 0 ? updatedBrackets[0] : null;
            setSelectedBracketId(nextBracket ? nextBracket.id : null);

            return updatedBrackets;
          }
        );

        // Reset all state variables
        setSelectedBracketId(null);
        setBracketId(null);
        setTournamentName("");
        setCaptains([]);
        setTeamSize(3);
        setBracket([]);
        setNumCaptains(8);
        setShowLosersBracket(false);
        setLosersBracket([]);
        setPlayers([]);
        setTournamentCreated(false);

        // Invalidate the brackets query to trigger a refetch
        queryClient.invalidateQueries(["brackets", user?.id]);

        toast.success({ title: "Tournament deleted successfully" });
      } catch (error) {
        console.error("Error deleting bracket:", error);
        toast.error({ title: "Failed to delete tournament" });
      }
    }
  };

  const createBracketMutation = useMutation({
    mutationFn: async (bracketData: {
      name: string;
      data: any;
      user_id: string;
    }) => {
      const response = await fetch("http://localhost:9001/brackets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...bracketData, user_id: user?.id }),
      });
      if (!response.ok) throw new Error("Failed to create bracket");
      return response.json();
    },
    onSuccess: (data) => {
      setBracketId(data.id);
      queryClient.setQueryData(["bracket", data.id], data);
      queryClient.invalidateQueries(["brackets", user?.id]);
      toast.success({ title: "Bracket created successfully" });
    },
    onError: () => {
      toast.error({ title: "Failed to create bracket" });
    },
  });

  const updateBracketMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await fetch(
        `http://localhost:9001/brackets/${id}?user_id=${user?.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ data }),
        }
      );
      if (!response.ok) throw new Error("Failed to update bracket");
      return response.json();
    },
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries(["bracket", id]);
      const previousBracket = queryClient.getQueryData(["bracket", id]);
      queryClient.setQueryData(["bracket", id], (old: any) => ({
        ...old,
        data,
      }));
      return { previousBracket };
    },
    onError: (err, newBracket, context) => {
      queryClient.setQueryData(
        ["bracket", newBracket.id],
        context.previousBracket
      );
      toast.error({ title: "Failed to update bracket" });
    },
    onSettled: (data) => {
      queryClient.invalidateQueries(["bracket", data.id]);
    },
  });

  const updateBracket = useCallback(() => {
    if (bracketId) {
      const bracketData = {
        bracket,
        losersBracket,
        captains,
        players,
        teamSize,
        numCaptains,
        showLosersBracket,
        selectedGameMode,
      };
      updateBracketMutation.mutate({ id: bracketId, data: bracketData });
    }
  }, [
    bracketId,
    bracket,
    losersBracket,
    captains,
    players,
    teamSize,
    numCaptains,
    showLosersBracket,
    selectedGameMode,
    updateBracketMutation,
  ]);

  // Add this function to generate a sharable URL
  const generateShareableUrl = useCallback(() => {
    if (!selectedBracketId) {
      toast.error({
        title: "Please save the tournament first before sharing.",
      });
      return;
    }

    const shareableUrl = `${window.location.origin}/teampicker/${selectedBracketId}`;

    navigator.clipboard.writeText(shareableUrl).then(
      () => {
        console.log("Shareable URL copied to clipboard:", shareableUrl);
        toast.success({ title: "Shareable URL copied to clipboard!" });
      },
      (err) => {
        console.error("Could not copy text: ", err);
        toast.error({ title: "Failed to copy shareable URL" });
      }
    );
  }, [selectedBracketId]);

  // Add these new functions
  const handlePlayerDoubleClick = (playerId) => {
    const player = players.find((p) => p.id === playerId);
    if (player) {
      setEditingPlayer({ id: player.id, name: player.name });
    }
  };

  const handlePlayerNameChange = (e, playerId) => {
    setEditingPlayer((prev) => ({ ...prev, name: e.target.value }));
  };

  const handlePlayerNameSave = () => {
    if (editingPlayer) {
      updatePlayers(
        players.map((player) =>
          player.id === editingPlayer.id
            ? { ...player, name: editingPlayer.name }
            : player
        )
      );
      setEditingPlayer(null);
    }
  };

  const handleRankChange = (playerId, newAbbreviatedRank) => {
    updatePlayers(
      players.map((player) =>
        player.id === playerId
          ? {
              ...player,
              abbreviatedRank: newAbbreviatedRank,
              rank: getFullRankName(newAbbreviatedRank), // Convert abbreviated to full rank
              iconUrl: RANK_IMAGES[newAbbreviatedRank], // Update iconUrl based on the new rank
            }
          : player
      )
    );
  };

  const handleTeamDoubleClick = (captainId) => {
    const captain = captains.find((c) => c.id === captainId);
    if (captain) {
      setEditingTeam({ id: captain.id, name: captain.name });
    }
  };

  const handleTeamNameChange = (e) => {
    setEditingTeam((prev) => ({ ...prev, name: e.target.value }));
  };

  const handleTeamNameSave = () => {
    if (editingTeam) {
      setCaptains(
        captains.map((captain) =>
          captain.id === editingTeam.id
            ? { ...captain, name: editingTeam.name }
            : captain
        )
      );
      setEditingTeam(null);
    }
  };

  const handleTeamReorder = (captainIndex, newPosition) => {
    const position = parseInt(newPosition, 10);
    if (position >= 1 && position <= captains.length && !isNaN(position)) {
      const newCaptains = [...captains];
      const [movedCaptain] = newCaptains.splice(captainIndex, 1);
      newCaptains.splice(position - 1, 0, movedCaptain);
      setCaptains(newCaptains);
    }
    setReorderingTeam(null);
    setReorderingValue("");
  };

  const handleTeamNumberChange = (captainIndex, change, event) => {
    event.preventDefault();
    event.stopPropagation();
    let newPosition = parseInt(reorderingValue, 10) - change; // Note the minus sign here
    if (newPosition < 1) {
      newPosition = captains.length;
    } else if (newPosition > captains.length) {
      newPosition = 1;
    }
    setReorderingValue(newPosition.toString());
  };

  const disqualifyTeam = (
    roundIndex,
    matchIndex,
    isTeam1,
    isLosersBracket = false
  ) => {
    if (window.confirm("Are you sure you want to disqualify this team?")) {
      if (isLosersBracket) {
        const updatedLosersBracket = [...losersBracket];
        const match = updatedLosersBracket[roundIndex][matchIndex];
        const disqualifiedTeam = isTeam1 ? match.team1 : match.team2;
        match.winner = isTeam1 ? match.team2 : match.team1;
        disqualifiedTeam.disqualified = true;

        if (roundIndex + 1 < updatedLosersBracket.length) {
          const nextMatchIndex = Math.floor(matchIndex / 2);
          const isFirstTeam = matchIndex % 2 === 0;
          const winningTeam = { ...match.winner, score: 0 };
          delete winningTeam.winner;
          updatedLosersBracket[roundIndex + 1][nextMatchIndex][
            isFirstTeam ? "team1" : "team2"
          ] = winningTeam;
        } else {
          const updatedBracket = [...bracket];
          const grandFinal = updatedBracket[updatedBracket.length - 1][0];
          grandFinal.team2 = { ...match.winner, score: 0 };
          setBracket(updatedBracket);
        }

        setLosersBracket(updatedLosersBracket);
      } else {
        const updatedBracket = [...bracket];
        const match = updatedBracket[roundIndex][matchIndex];
        const disqualifiedTeam = isTeam1 ? match.team1 : match.team2;
        match.winner = isTeam1 ? match.team2 : match.team1;
        disqualifiedTeam.disqualified = true;

        if (roundIndex + 1 < updatedBracket.length) {
          const nextMatchIndex = Math.floor(matchIndex / 2);
          const isFirstTeam = matchIndex % 2 === 0;
          const winningTeam = { ...match.winner, score: 0 };
          delete winningTeam.winner;
          updatedBracket[roundIndex + 1][nextMatchIndex][
            isFirstTeam ? "team1" : "team2"
          ] = winningTeam;
        }

        setBracket(updatedBracket);

        if (showLosersBracket && roundIndex === 0) {
          const loserTeam = isTeam1 ? match.team1 : match.team2;
          if (!loserTeam.disqualified) {
            const updatedLosersBracket = [...losersBracket];
            if (updatedLosersBracket[0][Math.floor(matchIndex / 2)]) {
              updatedLosersBracket[0][Math.floor(matchIndex / 2)][
                matchIndex % 2 === 0 ? "team1" : "team2"
              ] = { ...loserTeam, score: 0 };
            }
            setLosersBracket(updatedLosersBracket);
          }
        }
      }
    }
  };

  const updatePlayers = (newPlayers) => {
    setPlayers(newPlayers);
  };

  const handleGameModeChange = (newGameMode) => {
    setSelectedGameMode(newGameMode);
    updatePlayerRanks(newGameMode);
  };

  // Make sure this function is defined and working correctly
  const updatePlayerRanks = (gameMode) => {
    if (!cachedUserResponse) return;

    const updatePlayerData = (player) => {
      const userData = cachedUserResponse[player.name];
      if (userData) {
        const relevantData = extractRelevantData(userData, gameMode);
        if (relevantData) {
          return {
            ...player,
            ...relevantData,
          };
        }
      }
      return player;
    };

    // Update players list
    const updatedPlayers = players.map(updatePlayerData);
    updatePlayers(updatedPlayers);

    // Update captains' teams
    const updatedCaptains = captains.map((captain) => ({
      ...captain,
      players: captain.players.map(updatePlayerData),
    }));
    setCaptains(updatedCaptains);
  };

  // Define a query key for the user response data
  const userResponseQueryKey = ["userResponse"];

  // Use useQuery to fetch and cache the user response data
  const { data: cachedUserResponse, isLoading: isLoadingUserResponse } =
    useQuery({
      queryKey: userResponseQueryKey,
      queryFn: () => {
        const savedUserResponse = localStorage.getItem("userResponse");
        return savedUserResponse ? JSON.parse(savedUserResponse) : null;
      },
      initialData: null,
    });

  // Use useMutation to update the user response data
  const updateUserResponseMutation = useMutation({
    mutationFn: (newUserResponse) => {
      localStorage.setItem("userResponse", JSON.stringify(newUserResponse));
      return newUserResponse;
    },
    onSuccess: (newUserResponse) => {
      queryClient.setQueryData(userResponseQueryKey, newUserResponse);
    },
  });

  // Function to update user response data
  const updateUserResponse = (newUserResponse) => {
    updateUserResponseMutation.mutate(newUserResponse);
  };

  const fetchRankFromAPI = async (username) => {
    if (!isOnlineMode) {
      console.log("Offline mode: Generating random rank");
      return getRandomRank();
    }

    try {
      console.log(`Fetching rank for username: ${username}`);

      // Check if we have cached data for this username
      if (cachedUserResponse && cachedUserResponse[username]) {
        console.log("Using cached data for", username);
        return extractRelevantData(
          cachedUserResponse[username],
          selectedGameMode
        );
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SITE_URL}/api/rocket-league/?platform=epic&username=${encodeURIComponent(username)}`
      );
      console.log("API response status:", response.status);

      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.status}`);
      }

      const data = await response.json();
      console.log(
        "API response data for " + selectedGameMode + ":",
        JSON.stringify(data, null, 2)
      );

      // Store the entire response data
      updateUserResponse({
        ...cachedUserResponse,
        [username]: data,
      });

      // Extract and return the relevant data for the current game mode
      return extractRelevantData(data, selectedGameMode);
    } catch (error) {
      console.error("Error fetching rank:", error);
      throw error;
    }
  };

  // New helper function to extract relevant data
  const extractRelevantData = (data, gameMode) => {
    // Map the game mode names to their possible API segment names
    const gameModeMap = {
      "Ranked Duel 1v1": ["Ranked Duel 1v1", "Un-Ranked Duel 1v1"],
      "Ranked Doubles 2v2": ["Ranked Doubles 2v2", "Un-Ranked Doubles 2v2"],
      "Ranked Standard 3v3": ["Ranked Standard 3v3", "Un-Ranked Standard 3v3"],
      "Ranked Hoops 2v2": ["Ranked Hoops", "Hoops"],
      "Ranked Rumble 3v3": ["Ranked Rumble", "Rumble"],
      "Ranked Dropshot 3v3": ["Ranked Dropshot", "Dropshot"],
      "Ranked Snowday 3v3": ["Ranked Snow Day", "Snow Day", "Snowday"],
      "Tournament Matches": ["Tournament Matches"],
    };

    // Find the segment that matches the selected game mode
    const possibleSegmentNames = gameModeMap[gameMode] || [gameMode];
    let segment = data.segments.find((seg) =>
      possibleSegmentNames.includes(seg.metadata.name)
    );

    // If segment is not found, try a more flexible search
    if (!segment) {
      segment = data.segments.find((seg) =>
        possibleSegmentNames.some((name) =>
          seg.metadata.name.toLowerCase().includes(name.toLowerCase())
        )
      );
    }

    if (segment && segment.stats) {
      const tierName = segment.stats.tier?.metadata.name;
      const division = segment.stats.division?.metadata.name;
      const rank =
        tierName === "Supersonic Legend"
          ? "Supersonic Legend"
          : tierName && division
            ? `${tierName} ${division}`
            : "Unranked";
      const abbreviatedRank = abbreviateRank(rank);
      const iconUrl = segment.stats.tier?.metadata.iconUrl || "";
      const ratingValue = segment.stats.rating?.value;
      const ratingDisplayValue = segment.stats.rating?.displayValue;

      // Find peak rating for the selected game mode
      const peakSegment = data.segments.find(
        (seg) =>
          seg.type === "peak-rating" &&
          possibleSegmentNames.includes(seg.metadata.name)
      );
      const peakTierName = peakSegment?.stats?.peakRating?.metadata?.name;
      const peakDivision = peakSegment?.stats?.peakRating?.metadata?.division;
      const peakRankFull =
        peakTierName === "Supersonic Legend"
          ? "Supersonic Legend"
          : peakTierName && peakDivision
            ? `${peakTierName} ${peakDivision}`
            : "Unranked";
      const peakRankAbbreviated = abbreviateRank(peakRankFull);
      const peakIconUrl =
        peakSegment?.stats?.peakRating?.metadata?.iconUrl || "";
      const peakRatingValue = peakSegment?.stats?.peakRating?.value;
      const peakRatingDisplayValue =
        peakSegment?.stats?.peakRating?.displayValue;

      console.log("Full rank:", rank);
      console.log("Abbreviated rank:", abbreviatedRank);
      console.log("Peak full rank:", peakRankFull);
      console.log("Peak abbreviated rank:", peakRankAbbreviated);

      return {
        rank,
        abbreviatedRank,
        iconUrl,
        ratingValue,
        ratingDisplayValue,
        peakRank: peakRankAbbreviated,
        peakIconUrl,
        peakRankFull,
        peakRatingValue,
        peakRatingDisplayValue,
      };
    }

    // If no matching segment is found, return null or a default value
    return null;
  };

  const getRandomRank = () => {
    const randomRank =
      ROCKET_LEAGUE_RANKS[
        Math.floor(Math.random() * ROCKET_LEAGUE_RANKS.length)
      ];
    return {
      rank: getFullRankName(randomRank.name),
      abbreviatedRank: randomRank.name,
      iconUrl: randomRank.iconUrl,
      peakRank: null,
      peakIconUrl: null,
    };
  };

  const getRandomSubtleColor = () => {
    const hue = Math.floor(Math.random() * 360);
    return `hsla(${hue}, 30%, 25%, 0.3)`;
  };

  const createNewTournament = async () => {
    try {
      // Reset all state variables
      setCaptains([]);
      setTeamSize(3);
      setBracket([]);
      setNumCaptains(8);
      setShowLosersBracket(false);
      setLosersBracket([]);
      setPlayers([]);

      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from("Bracket")
        .insert({
          name: "New Tournament",
          data: {},
          created_at: now,
          updated_at: now,
          user_id: user?.id || "NO_USER_ID_FOUND",
          owner_id: user?.id || "NO_USER_ID_FOUND",
        })
        .select()
        .single();

      if (error) throw error;

      setBracketId(data.id);
      setSelectedBracketId(data.id);
      setTournamentName("New Tournament");
      setTournamentCreated(true);

      // Invalidate and refetch the brackets query to update the dropdown
      queryClient.invalidateQueries(["brackets"]);

      toast.success({ title: "New tournament created and selected" });
    } catch (error) {
      console.error("Error creating new tournament:", error);
      toast.error({ title: "Failed to create new tournament" });
    }
  };

  const saveTournament = async () => {
    if (!selectedBracketId) {
      toast.error({ title: "No tournament selected" });
      return;
    }

    const tournamentData = {
      name: tournamentName,
      data: {
        captains,
        players,
        teamSize,
        bracket,
        numCaptains,
        showLosersBracket,
        losersBracket,
        selectedGameMode,
      },
    };

    try {
      const { data, error } = await supabase
        .from("Bracket")
        .update(tournamentData)
        .eq("id", selectedBracketId);

      if (error) throw error;

      console.log("Tournament saved successfully");
      // Optionally, you can still show a toast for successful saves
      // toast.success({ title: "Tournament saved successfully" });
    } catch (error) {
      console.error("Error saving tournament:", error);
      toast.error({ title: "Failed to save tournament" });
    }
  };

  const onDragEnd = useCallback(
    (result) => {
      const { source, destination } = result;

      if (!destination) {
        setTrashOpen(false);
        return;
      }

      if (
        source.droppableId === destination.droppableId &&
        source.index === destination.index
      ) {
        return;
      }

      let newCaptains = [...captains];
      let newPlayers = [...players];

      if (destination.droppableId === "trash") {
        // ... (rest of the trash logic)
      } else if (
        source.droppableId === "players" &&
        destination.droppableId.startsWith("captain-")
      ) {
        // Find the player by their ID instead of index
        const movedPlayer = players.find((p, idx) => idx === source.index);
        if (!movedPlayer) return;

        newPlayers = newPlayers.filter(
          (player) => player.id !== movedPlayer.id
        );

        newCaptains = newCaptains.map((captain) => {
          if (captain.id === destination.droppableId) {
            return {
              ...captain,
              players: [...captain.players, movedPlayer],
            };
          }
          return captain;
        });
      } else if (
        source.droppableId.startsWith("captain-") &&
        destination.droppableId.startsWith("captain-")
      ) {
        const sourceCaptain = newCaptains.find(
          (c) => c.id === source.droppableId
        );
        if (!sourceCaptain) return;
        const movedPlayer = sourceCaptain.players[source.index];

        newCaptains = newCaptains.map((captain) => {
          if (captain.id === source.droppableId) {
            return {
              ...captain,
              players: captain.players.filter(
                (_, index) => index !== source.index
              ),
            };
          }
          if (captain.id === destination.droppableId) {
            return {
              ...captain,
              players: [...captain.players, movedPlayer],
            };
          }
          return captain;
        });
      } else if (
        source.droppableId.startsWith("captain-") &&
        destination.droppableId === "players"
      ) {
        const sourceCaptain = newCaptains.find(
          (c) => c.id === source.droppableId
        );
        if (!sourceCaptain) return;
        const movedPlayer = sourceCaptain.players[source.index];

        newCaptains = newCaptains.map((captain) => {
          if (captain.id === source.droppableId) {
            return {
              ...captain,
              players: captain.players.filter(
                (_, index) => index !== source.index
              ),
            };
          }
          return captain;
        });

        newPlayers = [...newPlayers, movedPlayer];
      } else if (
        source.droppableId === "players" &&
        destination.droppableId === "players"
      ) {
        const [reorderedItem] = newPlayers.splice(source.index, 1);
        newPlayers.splice(destination.index, 0, reorderedItem);
      }

      // Sort players by rank
      newPlayers = sortPlayersByRank(newPlayers);

      // Update state
      setCaptains(newCaptains);
      setPlayers(newPlayers);

      // Save changes immediately
      if (bracketId) {
        const bracketData = {
          bracket,
          losersBracket,
          captains: newCaptains,
          players: newPlayers,
          teamSize,
          numCaptains,
          showLosersBracket,
          selectedGameMode,
        };
        updateBracketMutation.mutate({ id: bracketId, data: bracketData });
      }
    },
    [
      players,
      captains,
      bracketId,
      bracket,
      losersBracket,
      teamSize,
      numCaptains,
      showLosersBracket,
      selectedGameMode,
      updateBracketMutation,
    ]
  );

  const onDragStart = () => setTrashOpen(true);
  const onDragUpdate = (update) => {
    if (!update.destination) {
      setTrashOpen(true);
    } else {
      setTrashOpen(false);
    }
  };

  const removeCaptain = (captainId) => {
    if (window.confirm("Are you sure you want to remove this team?")) {
      const teamToRemove = captains.find((c) => c.id === captainId);
      if (teamToRemove) {
        // Move all players except the captain back to the players list
        const playersToMove = teamToRemove.players.slice(1);
        updatePlayers((prevPlayers) => [...prevPlayers, ...playersToMove]);

        // Remove the team from captains
        setCaptains(captains.filter((c) => c.id !== captainId));
      }
    }
    updateBracket();
  };

  const removePlayer = (playerId) => {
    if (window.confirm("Are you sure you want to remove this player?")) {
      updatePlayers(
        players.filter((player) => player && player.id !== playerId)
      );
    }
    updateBracket();
  };

  const handleDoubleClick = (playerId, captainId) => {
    // Remove the player from the captain's team
    const newCaptains = captains.map((captain) => {
      if (captain.id === captainId) {
        const updatedPlayers = captain.players.filter(
          (player) => player && player.id !== playerId
        );
        return {
          ...captain,
          players: updatedPlayers,
        };
      }
      return captain;
    });

    // Find the player to move back to the players list
    const playerToMove = captains
      .find((captain) => captain.id === captainId)
      ?.players.find((player) => player && player.id === playerId);

    if (playerToMove) {
      // Update players list
      const newPlayers = [...players, playerToMove];

      // Update state
      setCaptains(newCaptains);
      setPlayers(newPlayers);

      // Save changes immediately
      if (bracketId) {
        const bracketData = {
          bracket,
          losersBracket,
          captains: newCaptains,
          players: newPlayers,
          teamSize,
          numCaptains,
          showLosersBracket,
          selectedGameMode,
        };
        updateBracketMutation.mutate({ id: bracketId, data: bracketData });
      }
    }
  };

  const clearAllData = () => {
    if (
      window.confirm(
        "Are you sure you want to clear all data? This action cannot be undone."
      )
    ) {
      setCaptains([]);
      updatePlayers([]);
      setTeamSize(3);
      setBracket([]);
      setNumCaptains(8); // Set to 8 captains by default
      setShowLosersBracket(false);
      setLosersBracket([]);
      setIsOnlineMode(true);
      setNewName("");
    }
  };

  const generateRandomName = () => {
    const firstNames = [
      "Alex",
      "Sam",
      "Jordan",
      "Taylor",
      "Casey",
      "Riley",
      "Morgan",
      "Avery",
      "Quinn",
      "Skyler",
    ];
    const lastNames = [
      "Smith",
      "Johnson",
      "Williams",
      "Brown",
      "Jones",
      "Garcia",
      "Miller",
      "Davis",
      "Rodriguez",
      "Martinez",
    ];
    return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
  };

  const populateTestData = () => {
    // Generate 8 random captains
    const newCaptains = Array.from({ length: 8 }, (_, index) => {
      const captainName = generateRandomName();
      const randomRank =
        ROCKET_LEAGUE_RANKS[
          Math.floor(Math.random() * ROCKET_LEAGUE_RANKS.length)
        ];
      return {
        id: `captain-${Date.now()}-${index}`,
        name: captainName,
        players: [
          {
            id: `player-${Date.now()}-${index}`,
            name: captainName,
            color: getRandomSubtleColor(),
            rank: getFullRankName(randomRank.name),
            abbreviatedRank: randomRank.name,
            iconUrl: randomRank.iconUrl,
          },
        ],
      };
    });

    // Generate 16 additional random players (3 per team * 8 teams - 8 captains)
    const newPlayers = Array.from({ length: 16 }, (_, index) => {
      const randomRank =
        ROCKET_LEAGUE_RANKS[
          Math.floor(Math.random() * ROCKET_LEAGUE_RANKS.length)
        ];
      return {
        id: `player-${Date.now()}-${index + 8}`,
        name: generateRandomName(),
        color: getRandomSubtleColor(),
        rank: getFullRankName(randomRank.name),
        abbreviatedRank: randomRank.name,
        iconUrl: randomRank.iconUrl,
      };
    });

    setCaptains(newCaptains);
    setPlayers(newPlayers);
    setTeamSize(3); // Set team size to 3
    setIsOnlineMode(false); // Turn off online mode
  };

  const pickTeams = () => {
    const sortedCaptains = [...captains].sort(
      (a, b) =>
        RANK_ORDER.indexOf(a.players[0].abbreviatedRank) -
        RANK_ORDER.indexOf(b.players[0].abbreviatedRank)
    );

    const sortedPlayers = [...players].sort(
      (a, b) =>
        RANK_ORDER.indexOf(b.abbreviatedRank) -
        RANK_ORDER.indexOf(a.abbreviatedRank)
    );

    const newCaptains = sortedCaptains.map((captain) => ({
      ...captain,
      players: [captain.players[0]],
    }));

    while (sortedPlayers.length > 0) {
      for (const captain of newCaptains) {
        if (sortedPlayers.length > 0) {
          const bestPlayerIndex = sortedPlayers.findIndex(
            (player) =>
              RANK_ORDER.indexOf(player.abbreviatedRank) >=
              RANK_ORDER.indexOf(captain.players[0].abbreviatedRank)
          );

          const playerIndex = bestPlayerIndex !== -1 ? bestPlayerIndex : 0;
          const [player] = sortedPlayers.splice(playerIndex, 1);
          captain.players.push(player);
        }
      }
      newCaptains.reverse();
    }

    setCaptains(newCaptains);
    updatePlayers([]);
  };

  const generateBracket = useCallback(() => {
    // Reset disqualified status and scores for all teams
    const resetTeams = (teams) => {
      return teams.map((team) => ({
        ...team,
        disqualified: false,
        score: 0,
        players: team.players.map((player) => ({
          ...player,
          disqualified: false,
        })),
      }));
    };

    const resetCaptains = resetTeams(captains);
    const resetPlayers = players.map((player) => ({
      ...player,
      disqualified: false,
    }));

    setCaptains(resetCaptains);
    updatePlayers(resetPlayers);

    const teamsWithFullRoster = resetCaptains.filter(
      (captain) => captain.players.length === teamSize
    );
    const newBrackets = createBrackets(teamsWithFullRoster, showLosersBracket);
    setBracket(newBrackets.winnersBracket);
    setLosersBracket(newBrackets.losersBracket);

    // Create bracket data and call mutation
    const bracketData = {
      name: "New Tournament",
      data: {
        bracket: newBrackets.winnersBracket,
        losersBracket: newBrackets.losersBracket,
        captains: resetCaptains,
        teamSize,
        numCaptains,
        showLosersBracket,
      },
    };
    createBracketMutation.mutate(bracketData);
  }, [
    captains,
    players,
    teamSize,
    numCaptains,
    showLosersBracket,
    createBracketMutation,
    updatePlayers,
  ]);

  const handleWinnerSelection = (
    roundIndex,
    matchIndex,
    isLosersBracket = false
  ) => {
    setScoreUpdateInfo({ roundIndex, matchIndex, isLosersBracket });
    setTeam1Score("");
    setTeam2Score("");
    setScoreDialogOpen(true);
  };

  const handleScoreSubmit = () => {
    const blueScore = parseInt(team1Score, 10);
    const orangeScore = parseInt(team2Score, 10);
    if (
      isNaN(blueScore) ||
      isNaN(orangeScore) ||
      blueScore < 0 ||
      orangeScore < 0
    ) {
      alert("Please enter valid non-negative numbers for both scores.");
      return;
    }
    if (blueScore === orangeScore) {
      alert("Scores cannot be equal. There must be a winner.");
      return;
    }

    const { roundIndex, matchIndex, isLosersBracket } = scoreUpdateInfo;

    if (isLosersBracket) {
      const { updatedLosersBracket, updatedWinnersBracket } =
        updateLosersBracket(
          losersBracket,
          bracket,
          roundIndex,
          matchIndex,
          blueScore,
          orangeScore
        );
      setLosersBracket(updatedLosersBracket);
      setBracket(updatedWinnersBracket);
    } else {
      const updatedBracket = updateWinnersBracket(
        bracket,
        roundIndex,
        matchIndex,
        blueScore,
        orangeScore
      );
      setBracket(updatedBracket);

      if (showLosersBracket && roundIndex < bracket.length - 1) {
        const loserTeam =
          blueScore < orangeScore
            ? updatedBracket[roundIndex][matchIndex].team1
            : updatedBracket[roundIndex][matchIndex].team2;
        if (!loserTeam.disqualified) {
          const updatedLosersBracket = [...losersBracket];
          const losersRoundIndex = Math.floor(roundIndex / 2);
          const nextSlot = findNextOpenSlotInLosersBracket(
            updatedLosersBracket,
            losersRoundIndex
          );
          if (nextSlot) {
            const { matchIndex: losersMatchIndex, isFirstTeam } = nextSlot;
            updatedLosersBracket[losersRoundIndex][losersMatchIndex][
              isFirstTeam ? "team1" : "team2"
            ] = { ...loserTeam, score: 0 };
            setLosersBracket(updatedLosersBracket);
          }
        }
      }
    }

    setScoreDialogOpen(false);
  };

  const onBracketDragEnd = (result) => {
    if (!result.destination) return;

    const { source, destination } = result;
    const sourceRoundIndex = parseInt(source.droppableId.split("-")[1]);
    const destRoundIndex = parseInt(destination.droppableId.split("-")[1]);

    if (sourceRoundIndex !== destRoundIndex) return;

    const updatedBracket = [...bracket];
    const round = updatedBracket[sourceRoundIndex];
    const sourceMatchIndex = Math.floor(source.index / 2);
    const destMatchIndex = Math.floor(destination.index / 2);
    const isTeam1 = source.index % 2 === 0;

    if (sourceMatchIndex === destMatchIndex) {
      const match = round[sourceMatchIndex];
      [match.team1, match.team2] = [match.team2, match.team1];
    } else {
      const sourceMatch = round[sourceMatchIndex];
      const destMatch = round[destMatchIndex];
      const teamToMove = isTeam1 ? sourceMatch.team1 : sourceMatch.team2;
      const isDestTeam1 = destination.index % 2 === 0;

      if (isDestTeam1) {
        [sourceMatch[isTeam1 ? "team1" : "team2"], destMatch.team1] = [
          destMatch.team1,
          teamToMove,
        ];
      } else {
        [sourceMatch[isTeam1 ? "team1" : "team2"], destMatch.team2] = [
          destMatch.team2,
          teamToMove,
        ];
      }
    }

    setBracket(updatedBracket);
  };

  const renderBracket = () => {
    if (bracket.length === 0) return null;

    return (
      <DragDropContext onDragEnd={onBracketDragEnd}>
        <div className="mt-12 overflow-x-auto">
          <h2 className={`mb-6 text-3xl font-bold text-white`}>
            Tournament Bracket
          </h2>
          <div className="flex space-x-8">
            {bracket.map((round, roundIndex) => (
              <div key={roundIndex} className="flex flex-col">
                <div
                  className={`mb-4 text-center text-sm font-semibold text-zinc-400`}
                >
                  {roundIndex === 0
                    ? "Round 1"
                    : showLosersBracket && roundIndex === bracket.length - 1
                      ? "Grand Final"
                      : roundIndex === bracket.length - 1
                        ? "Final"
                        : `Round ${roundIndex + 1}`}
                </div>
                <Droppable droppableId={`round-${roundIndex}`}>
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className={`flex flex-col space-y-6 ${roundIndex > 0 ? "h-full justify-around" : ""}`}
                    >
                      {round.map((match, matchIndex) => (
                        <div
                          key={`${roundIndex}-${matchIndex}`}
                          className={`relative ${roundIndex > 0 ? "my-4" : ""}`}
                          style={{
                            marginTop:
                              roundIndex > 0
                                ? `${Math.pow(2, roundIndex) * 3 - 3}rem`
                                : "0",
                          }}
                        >
                          <div className="w-72 rounded-lg border border-zinc-700 bg-zinc-800/50 p-4 shadow-lg">
                            {[match.team1, match.team2].map(
                              (team, teamIndex) => (
                                <Draggable
                                  key={`${roundIndex}-${matchIndex}-${teamIndex + 1}`}
                                  draggableId={`${roundIndex}-${matchIndex}-${teamIndex + 1}`}
                                  index={matchIndex * 2 + teamIndex}
                                  isDragDisabled={
                                    !team || !!match.winner || team.isBye
                                  }
                                >
                                  {(provided, snapshot) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      className={`mb-2 flex items-center rounded p-2 ${
                                        match.winner
                                          ? match.winner === team
                                            ? "bg-green-900/50 font-bold"
                                            : "bg-red-900/50"
                                          : teamIndex === 0
                                            ? "bg-blue-900/40"
                                            : "bg-orange-900/40"
                                      } ${snapshot.isDragging ? "opacity-50" : ""} ${!team || match.winner || team.isBye ? "cursor-not-allowed" : "cursor-grab"}`}
                                      onDoubleClick={() =>
                                        disqualifyTeam(
                                          roundIndex,
                                          matchIndex,
                                          teamIndex === 0
                                        )
                                      }
                                    >
                                      <div className="w-6 flex-shrink-0">
                                        {match.winner === team &&
                                          team?.name &&
                                          !team?.isBye && (
                                            <Crown className="h-4 w-4 text-yellow-400" />
                                          )}
                                      </div>
                                      <div
                                        className={`flex-grow truncate text-zinc-200 ${team?.disqualified ? "line-through" : ""}`}
                                      >
                                        {team?.isBye
                                          ? "BYE"
                                          : team?.name || "TBD"}
                                      </div>
                                      <div className="w-8 text-right">
                                        <span className="m-0 rounded bg-zinc-700/50 px-2 py-1 text-sm text-zinc-300">
                                          {team?.isBye
                                            ? "-"
                                            : team?.score || "0"}
                                        </span>
                                      </div>
                                      {team?.disqualified && (
                                        <span className="ml-2 rounded bg-red-600 px-2 py-1 text-xs text-white">
                                          DQ
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </Draggable>
                              )
                            )}
                            {!match.winner &&
                              match.team1 &&
                              match.team2 &&
                              !match.team2.isBye && (
                                <div className="mt-3 flex justify-center">
                                  <button
                                    onClick={() =>
                                      handleWinnerSelection(
                                        roundIndex,
                                        matchIndex
                                      )
                                    }
                                    className="rounded bg-blue-600 px-3 py-1 text-xs text-zinc-200 transition-colors duration-200 hover:bg-blue-700"
                                  >
                                    Enter Scores
                                  </button>
                                </div>
                              )}
                          </div>
                          {roundIndex < bracket.length - 1 && (
                            <div className="absolute -right-5 top-1/2 -translate-y-1/2 transform">
                              <ChevronRight
                                className="text-zinc-500"
                                size={20}
                              />
                            </div>
                          )}
                        </div>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </div>
      </DragDropContext>
    );
  };

  const renderLosersBracket = () => {
    if (!showLosersBracket || losersBracket.length === 0) return null;

    return (
      <div className="mt-16 overflow-x-auto">
        <h2 className={`mb-6 text-3xl font-bold text-white`}>Losers Bracket</h2>
        <div className="flex space-x-8">
          {losersBracket.map((round, roundIndex) => (
            <div key={roundIndex} className="flex flex-col">
              <div
                className={`mb-4 text-center text-sm font-semibold text-zinc-400`}
              >
                {`Losers Round ${roundIndex + 1}`}
              </div>
              <div className="flex h-full flex-col justify-around space-y-6">
                {round.map((match, matchIndex) => (
                  <div
                    key={`${roundIndex}-${matchIndex}`}
                    className="relative"
                    style={{
                      marginTop:
                        roundIndex > 0
                          ? `${Math.pow(2, roundIndex) * 3 - 3}rem`
                          : "0",
                    }}
                  >
                    <div className="w-72 rounded-lg border border-zinc-700 bg-zinc-800/50 p-4 shadow-lg">
                      {[match.team1, match.team2].map((team, teamIndex) => (
                        <div
                          key={`loser-${roundIndex}-${matchIndex}-${teamIndex}`}
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
                            {match.winner === team && team?.name && (
                              <Crown className="h-4 w-4 text-yellow-400" />
                            )}
                          </div>
                          <div
                            className={`flex-grow truncate text-zinc-200 ${team?.disqualified ? "line-through" : ""}`}
                          >
                            {team?.name || "TBD"}
                          </div>
                          <div className="w-8 text-right">
                            <span className="rounded bg-zinc-700/50 px-2 py-1 text-sm text-zinc-300">
                              {team?.score || "0"}
                            </span>
                          </div>
                          {team?.disqualified && (
                            <span className="ml-2 rounded bg-red-600 px-2 py-1 text-xs text-white">
                              DQ
                            </span>
                          )}
                        </div>
                      ))}
                      {!match.winner && match.team1 && match.team2 && (
                        <div className="mt-3 flex justify-center">
                          <button
                            onClick={() =>
                              handleWinnerSelection(
                                roundIndex,
                                matchIndex,
                                true
                              )
                            }
                            className="rounded bg-blue-600 px-3 py-1 text-xs text-zinc-200 transition-colors duration-200 hover:bg-blue-700"
                          >
                            Enter Scores
                          </button>
                        </div>
                      )}
                    </div>
                    {roundIndex < losersBracket.length - 1 && (
                      <div className="absolute -right-5 top-1/2 -translate-y-1/2 transform">
                        <ChevronRight className="text-zinc-500" size={20} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      if (captains.length < numCaptains) {
        addItem("captain");
      } else {
        addItem("player");
      }
    }
  };

  // Add a button to generate the sharable URL
  const renderShareButton = () => (
    <Button
      onClick={generateShareableUrl}
      variant="default"
      className="rounded-lg border border-zinc-700 bg-green-600 text-zinc-200 transition-colors duration-200 hover:bg-green-500"
    >
      <Share className="mr-2 h-4 w-4" />
      Share View
    </Button>
  );

  // Add this function to check if at least two teams are ready
  const atLeastTwoTeamsReady = () => {
    return (
      captains.filter((captain) => captain.players.length === teamSize)
        .length >= 2
    );
  };

  const addItem = async (type: "captain" | "player") => {
    const name = newName || generateRandomName();
    let rankData;

    if (isOnlineMode) {
      try {
        rankData = await fetchRankFromAPI(name);
      } catch (error) {
        console.error("Error fetching rank data:", error);
        rankData = getRandomRank(); // Fallback to random rank if API fetch fails
      }
    } else {
      rankData = getRandomRank();
    }

    const newItem = {
      id: `${type}-${Date.now()}`,
      name,
      color: getRandomSubtleColor(),
      ...rankData,
    };

    if (type === "captain") {
      setCaptains([...captains, { ...newItem, players: [newItem] }]);
    } else {
      setPlayers([...players, newItem]);
    }

    setNewName("");
    updateBracket();
  };

  return (
    <Container maxWidth="full">
      <div className="mx-auto max-w-7xl">
        {!isLoaded && <Spinner className="w-8 fill-violet-300 text-white" />}

        <DashboardHeader
          category="Tournaments"
          title="Team Picker"
          description=""
          keyModalText=""
          buttonUrl={``}
          buttonText=""
          backText=""
        />

        <Tabs defaultValue="tournament" className="w-full">
          <TabsList className="grid w-full grid-cols-2 rounded-lg border border-zinc-700 bg-zinc-800/50 p-1">
            <TabsTrigger
              value="tournament"
              className="rounded-md data-[state=active]:bg-zinc-700"
            >
              Tournament
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="rounded-md data-[state=active]:bg-zinc-700"
            >
              Settings
            </TabsTrigger>
          </TabsList>
          <TabsContent value="tournament">
            <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-6">
              <h3 className="mb-4 text-lg font-semibold text-white">
                Tournament Management
              </h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Select
                    onValueChange={handleBracketSelect}
                    value={selectedBracketId || undefined}
                  >
                    <SelectTrigger className="w-[200px] rounded-lg border border-zinc-700 bg-zinc-800/50">
                      <SelectValue placeholder="Select a tournament" />
                    </SelectTrigger>
                    <SelectContent className="rounded-lg border border-zinc-700 bg-zinc-900/75">
                      {isBracketsLoading ? (
                        <SelectItem value="loading" disabled>
                          Loading...
                        </SelectItem>
                      ) : brackets && brackets.length > 0 ? (
                        brackets.map((bracket) => (
                          <SelectItem key={bracket.id} value={bracket.id}>
                            {bracket.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-tournaments" disabled>
                          No tournaments found
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={createNewTournament}
                    variant="outline"
                    size="sm"
                    className="rounded-lg border border-zinc-700 bg-zinc-800/50 text-zinc-200 transition-colors duration-200 hover:bg-zinc-700"
                  >
                    New Tournament
                  </Button>
                  <Button
                    onClick={saveTournament}
                    variant="default"
                    size="sm"
                    className="rounded-lg border border-zinc-700 bg-zinc-800/50 text-zinc-200 transition-colors duration-200 hover:bg-zinc-700"
                  >
                    Save Tournament
                  </Button>
                  {selectedBracketId && (
                    <>
                      <Button
                        onClick={() => handleOpenTournament(selectedBracketId)}
                        variant="outline"
                        size="sm"
                        className="rounded-lg border bg-blue-600/50 bg-zinc-800/50 text-zinc-200 transition-colors duration-200 hover:bg-blue-500/50"
                      >
                        Open <ExternalLink className="ml-2 h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => deleteBracket(selectedBracketId)}
                        variant="destructive"
                        size="sm"
                        className="rounded-lg border border-red-700 bg-red-900 text-zinc-200 hover:bg-red-800"
                      >
                        Delete
                      </Button>
                    </>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="tournament-name"
                    className="mb-1 block text-sm font-medium text-zinc-400"
                  >
                    Tournament Name
                  </label>
                  <input
                    id="tournament-name"
                    type="text"
                    value={tournamentName}
                    onChange={(e) => setTournamentName(e.target.value)}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 p-2 text-sm text-zinc-100 placeholder-zinc-500"
                  />
                </div>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="settings">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-6">
                <h3 className="mb-4 text-lg font-semibold text-white">
                  Game Settings
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="rounded-full bg-zinc-700/50 p-2">
                      <Users size={24} className="text-zinc-300" />
                    </div>
                    <div>
                      <label
                        htmlFor="team-size"
                        className="mb-1 block text-sm font-medium text-zinc-400"
                      >
                        Team Size
                      </label>
                      <input
                        id="team-size"
                        type="number"
                        value={teamSize}
                        onChange={(e) => {
                          const newSize = Math.max(
                            1,
                            parseInt(e.target.value, 10)
                          );
                          setTeamSize(newSize);
                        }}
                        className="w-20 rounded-lg border border-zinc-700 bg-zinc-800/50 p-2 text-sm text-zinc-100 placeholder-zinc-500"
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="rounded-full bg-zinc-700/50 p-2">
                      <Settings size={24} className="text-zinc-300" />
                    </div>
                    <div>
                      <label
                        htmlFor="num-captains"
                        className="mb-1 block text-sm font-medium text-zinc-400"
                      >
                        Captains
                      </label>
                      <input
                        id="num-captains"
                        type="number"
                        value={numCaptains}
                        onChange={(e) => {
                          const newNumCaptains = Math.max(
                            1,
                            parseInt(e.target.value, 10)
                          );
                          setNumCaptains(newNumCaptains);
                        }}
                        className="w-20 rounded-lg border border-zinc-700 bg-zinc-800/50 p-2 text-sm text-zinc-100 placeholder-zinc-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-6">
                <h3 className="mb-4 text-lg font-semibold text-white">
                  Mode Settings
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="rounded-full bg-zinc-700/50 p-2">
                      {isOnlineMode ? (
                        <Wifi size={24} className="text-zinc-300" />
                      ) : (
                        <WifiOff size={24} className="text-zinc-300" />
                      )}
                    </div>
                    <div>
                      <span className="mb-1 block text-sm font-medium text-zinc-400">
                        Mode
                      </span>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="online-mode"
                          checked={isOnlineMode}
                          onCheckedChange={setIsOnlineMode}
                        />
                        <Label
                          htmlFor="online-mode"
                          className="text-sm text-zinc-400"
                        >
                          {isOnlineMode ? "Online" : "Offline"}
                        </Label>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="rounded-full bg-zinc-700/50 p-2">
                      <Trophy size={24} className="text-zinc-300" />
                    </div>
                    <div>
                      <Label
                        htmlFor="game-mode"
                        className="mb-1 block text-sm font-medium text-zinc-400"
                      >
                        Game Mode
                      </Label>
                      <Select
                        value={selectedGameMode}
                        onValueChange={handleGameModeChange}
                      >
                        <SelectTrigger className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 p-2 text-sm text-zinc-100">
                          <SelectValue placeholder="Select a game mode" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Ranked Duel 1v1">
                            Ranked Duel 1v1
                          </SelectItem>
                          <SelectItem value="Ranked Doubles 2v2">
                            Ranked Doubles 2v2
                          </SelectItem>
                          <SelectItem value="Ranked Standard 3v3">
                            Ranked Standard 3v3
                          </SelectItem>
                          <SelectItem value="Ranked Hoops 2v2">
                            Ranked Hoops 2v2
                          </SelectItem>
                          <SelectItem value="Ranked Rumble 3v3">
                            Ranked Rumble 3v3
                          </SelectItem>
                          <SelectItem value="Ranked Dropshot 3v3">
                            Ranked Dropshot 3v3
                          </SelectItem>
                          <SelectItem value="Ranked Snowday 3v3">
                            Ranked Snowday 3v3
                          </SelectItem>
                          <SelectItem value="Tournament Matches">
                            Tournament Matches
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-wrap items-center space-x-2">
          <Button
            onClick={populateTestData}
            variant="secondary"
            className="rounded-lg border border-zinc-700 bg-purple-800/50 text-zinc-200 transition-colors duration-200 hover:bg-purple-700/50"
          >
            <Database className="mr-2 h-4 w-4" />
            Populate Test Data
          </Button>
          {captains.length === numCaptains && players.length > 0 && (
            <Button
              onClick={pickTeams}
              variant="default"
              className="rounded-lg border border-zinc-700 bg-blue-600 text-zinc-200 transition-colors duration-200 hover:bg-blue-500"
            >
              <Shuffle className="mr-2 h-4 w-4" />
              Pick Teams
            </Button>
          )}
          <Button
            onClick={generateShareableUrl}
            variant="default"
            className="rounded-lg border border-zinc-700 bg-green-600 text-zinc-200 transition-colors duration-200 hover:bg-green-500"
          >
            <Share className="mr-2 h-4 w-4" />
            Share View
          </Button>
        </div>

        {/* Add Player or Captain */}
        {tournamentCreated && (
          <div className="mt-6 rounded-lg border border-zinc-700 bg-zinc-800/50 p-6">
            <h3 className="mb-4 text-lg font-semibold text-white">
              Add Player or Captain
            </h3>
            <div className="flex items-end space-x-4">
              <div className="flex-grow">
                <input
                  id="new-name"
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter name"
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 p-2 text-sm text-zinc-100 placeholder-zinc-500"
                />
              </div>
              <div className="flex space-x-2">
                {captains.length < numCaptains ? (
                  <Button
                    onClick={() => addItem("captain")}
                    disabled={loading}
                    variant="outline"
                    className="rounded-lg border border-zinc-700 bg-zinc-800/50 text-zinc-200 transition-colors duration-200 hover:bg-zinc-700"
                  >
                    Add Captain
                  </Button>
                ) : (
                  <Button
                    onClick={() => addItem("player")}
                    disabled={loading}
                    variant="default"
                    className="rounded-lg border border-zinc-700 bg-zinc-800/50 text-zinc-200 transition-colors duration-200 hover:bg-zinc-700"
                  >
                    Add Player
                  </Button>
                )}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={clearAllData}
                        variant="destructive"
                        size="icon"
                        className="rounded-lg border border-zinc-700 bg-zinc-800/50 text-zinc-200 transition-colors duration-200 hover:bg-zinc-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Clear all data</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>
        )}

        <DragDropContext
          onDragEnd={onDragEnd}
          onDragStart={onDragStart}
          onDragUpdate={onDragUpdate}
        >
          <div className="mt-6 flex flex-wrap gap-6 overflow-visible pb-6">
            {players.length > 0 && (
              <Droppable droppableId="players" isDropDisabled={isStandalone}>
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="flex flex-col rounded-lg border border-zinc-700 bg-zinc-800/50"
                  >
                    <div className="p-4">
                      <h2 className={`text-xl text-white`}>Players</h2>
                    </div>
                    <ScrollArea className="flex flex-grow flex-col">
                      <div className="space-y-2 pb-4 pl-4 pr-4">
                        {sortPlayersByRank(players)
                          .filter((player) => player && player.id)
                          .map((player, index) => (
                            <Draggable
                              key={player.id}
                              draggableId={player.id}
                              index={index}
                              isDragDisabled={isStandalone}
                            >
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`group relative flex items-center justify-between rounded-md border border-zinc-700 text-white shadow transition-colors duration-200 hover:bg-zinc-600/50 ${
                                    isStandalone
                                      ? "cursor-default"
                                      : "cursor-grab"
                                  }`}
                                  style={{
                                    ...provided.draggableProps.style,
                                    backgroundColor: player.color,
                                  }}
                                >
                                  {!isStandalone && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        removePlayer(player.id);
                                      }}
                                      className="absolute left-0 top-1/2 flex h-8 w-8 -translate-y-1/2 transform items-center justify-center rounded-full p-0 text-zinc-400 opacity-0 transition-colors duration-200 hover:text-red-100 group-hover:opacity-100"
                                    >
                                      <X className="h-4 w-4" />
                                    </button>
                                  )}
                                  <div
                                    className="flex flex-grow cursor-grab items-center overflow-visible rounded-md text-white shadow transition-colors duration-200 hover:bg-zinc-700/50"
                                    style={{
                                      paddingLeft: "2rem",
                                    }}
                                  >
                                    <div className="flex flex-grow flex-col">
                                      {editingPlayer &&
                                      editingPlayer.id === player.id ? (
                                        <input
                                          value={editingPlayer.name}
                                          onChange={(e) =>
                                            handlePlayerNameChange(e, player.id)
                                          }
                                          onBlur={handlePlayerNameSave}
                                          onKeyPress={(e) => {
                                            if (e.key === "Enter") {
                                              handlePlayerNameSave();
                                            }
                                          }}
                                          className="w-full border-none bg-transparent p-2 text-zinc-100 focus:outline-none focus:ring-0"
                                          autoFocus
                                        />
                                      ) : (
                                        <div
                                          onDoubleClick={() =>
                                            handlePlayerDoubleClick(player.id)
                                          }
                                          className="w-full truncate p-2"
                                        >
                                          {player.name}
                                        </div>
                                      )}
                                    </div>
                                    <RankSelect
                                      value={player.abbreviatedRank}
                                      onChange={(newRank) =>
                                        handleRankChange(player.id, newRank)
                                      }
                                      color={player.color}
                                      iconUrl={player.iconUrl}
                                    />
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))}
                        {provided.placeholder}
                      </div>
                    </ScrollArea>
                  </div>
                )}
              </Droppable>
            )}

            <div className="grid flex-1 grid-cols-1 content-start gap-6 md:grid-cols-2 lg:grid-cols-3">
              {captains.map((captain, captainIndex) => (
                <Droppable
                  key={captain.id}
                  droppableId={captain.id}
                  isDropDisabled={captain.players.length >= teamSize}
                >
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className={`overflow-hidden rounded-lg border border-zinc-700 bg-zinc-800/50 ${captain.players.length >= teamSize ? "opacity-50" : ""}`}
                    >
                      <div className="flex flex-row items-center justify-between border-b border-zinc-700 bg-zinc-800/70 p-4 text-xl">
                        <div className="flex items-center">
                          {reorderingTeam === captainIndex ? (
                            <div className="mr-2 flex items-center">
                              <input
                                type="text"
                                value={reorderingValue}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  if (
                                    value === "" ||
                                    (/^\d+$/.test(value) &&
                                      parseInt(value, 10) <= captains.length)
                                  ) {
                                    setReorderingValue(value);
                                  }
                                }}
                                onBlur={() => {
                                  handleTeamReorder(
                                    captainIndex,
                                    reorderingValue
                                  );
                                  setReorderingTeam(null);
                                }}
                                onKeyPress={(e) => {
                                  if (e.key === "Enter") {
                                    handleTeamReorder(
                                      captainIndex,
                                      reorderingValue
                                    );
                                    setReorderingTeam(null);
                                  }
                                }}
                                className="w-12 rounded-lg border border-zinc-700 bg-zinc-800/50 p-1 text-center text-sm text-zinc-100"
                                autoFocus
                              />
                              <div className="ml-1 flex flex-col">
                                <button
                                  onMouseDown={(e) =>
                                    handleTeamNumberChange(captainIndex, -1, e)
                                  }
                                  className="text-zinc-400 hover:text-zinc-100"
                                >
                                  <ChevronUp className="h-4 w-4" />
                                </button>
                                <button
                                  onMouseDown={(e) =>
                                    handleTeamNumberChange(captainIndex, 1, e)
                                  }
                                  className="text-zinc-400 hover:text-zinc-100"
                                >
                                  <ChevronDown className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <span
                              className="mr-2 inline-block w-12 cursor-pointer text-center font-semibold text-zinc-400"
                              onDoubleClick={() => {
                                setReorderingTeam(captainIndex);
                                setReorderingValue(String(captainIndex + 1));
                              }}
                            >
                              {String(captainIndex + 1).padStart(2, "0")}.
                            </span>
                          )}
                          {editingTeam && editingTeam.id === captain.id ? (
                            <input
                              value={editingTeam.name}
                              onChange={handleTeamNameChange}
                              onBlur={handleTeamNameSave}
                              onKeyPress={(e) => {
                                if (e.key === "Enter") {
                                  handleTeamNameSave();
                                }
                              }}
                              className="w-full border-none bg-transparent text-zinc-100 focus:outline-none focus:ring-0"
                              autoFocus
                            />
                          ) : (
                            <h3
                              className={`flex cursor-pointer items-center text-lg text-white`}
                              onDoubleClick={() =>
                                handleTeamDoubleClick(captain.id)
                              }
                            >
                              <span className="mr-2 text-xl font-semibold text-zinc-400">
                                Team:
                              </span>
                              <span className="text-xl text-white">
                                {captain.name}
                              </span>
                            </h3>
                          )}
                        </div>
                        <button
                          onClick={() => removeCaptain(captain.id)}
                          className="flex h-6 w-6 items-center justify-center rounded-full p-0 text-zinc-400 transition-colors duration-200 hover:text-red-100"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="space-y-2 bg-zinc-800/30 p-4">
                        {captain.players
                          .filter((player) => player && player.id)
                          .map((player, index) => (
                            <Draggable
                              key={player.id}
                              draggableId={player.id}
                              index={index}
                              isDragDisabled={index === 0}
                            >
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`rounded-md p-2 shadow ${index === 0 ? "cursor-default" : "cursor-grab"} flex items-center justify-between text-white transition-colors duration-200 hover:bg-zinc-600/50`}
                                  style={{
                                    ...provided.draggableProps.style,
                                    backgroundColor: player.color,
                                    border:
                                      "1px solid rgba(255, 255, 255, 0.1)",
                                  }}
                                  onDoubleClick={() =>
                                    index !== 0 &&
                                    handleDoubleClick(player.id, captain.id)
                                  }
                                >
                                  <div className="flex items-center font-medium">
                                    {index === 0 && (
                                      <Crown className="mr-2 h-4 w-4 text-yellow-400" />
                                    )}
                                    {player.name}
                                  </div>
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <div className="flex items-center">
                                          <div className="mr-2 flex flex-col items-center">
                                            <img
                                              src={player.iconUrl}
                                              alt={player.rank}
                                              className="mb-1 h-8 w-8"
                                            />
                                            <span className="text-xs text-zinc-100">
                                              {player.abbreviatedRank}
                                            </span>
                                          </div>
                                          {player.peakRank && (
                                            <div className="flex flex-col items-center">
                                              <img
                                                src={player.peakIconUrl}
                                                alt={`Peak: ${player.peakRank}`}
                                                className="mb-1 h-8 w-8"
                                              />
                                              <span className="text-xs text-zinc-400">
                                                {player.peakRank}
                                              </span>
                                            </div>
                                          )}
                                        </div>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>
                                          Current: {player.rank} (
                                          {player.ratingDisplayValue || "N/A"})
                                        </p>
                                        {player.peakRankFull && (
                                          <p>
                                            Peak: {player.peakRankFull} (
                                            {player.peakRatingDisplayValue ||
                                              "N/A"}
                                            )
                                          </p>
                                        )}
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </div>
                              )}
                            </Draggable>
                          ))}
                        {provided.placeholder}
                      </div>
                    </div>
                  )}
                </Droppable>
              ))}
            </div>
          </div>
        </DragDropContext>

        {atLeastTwoTeamsReady() && (
          <div className="mt-8 flex items-center space-x-4">
            <Button
              onClick={generateBracket}
              className="flex items-center rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-2 text-sm text-zinc-200 transition-colors duration-200 hover:bg-zinc-700"
            >
              <Trophy className="mr-2 h-4 w-4" />
              Generate Tournament Bracket
            </Button>

            <div className="flex items-center">
              <Switch
                id="showLosersBracket"
                checked={showLosersBracket}
                onCheckedChange={setShowLosersBracket}
              />
              <Label
                htmlFor="showLosersBracket"
                className="ml-2 text-sm text-zinc-300"
              >
                Include Losers Bracket
              </Label>
            </div>
          </div>
        )}

        {renderBracket()}

        {showLosersBracket && renderLosersBracket()}

        <Dialog open={scoreDialogOpen} onOpenChange={setScoreDialogOpen}>
          <DialogContent className="w-96 rounded-lg border border-zinc-700 bg-zinc-900 p-6">
            <DialogTitle className="mb-4 text-lg font-semibold text-zinc-100">
              Enter Match Scores
            </DialogTitle>
            <div className="space-y-4">
              <div>
                <Label
                  htmlFor="team1Score"
                  className="mb-1 block text-zinc-300"
                >
                  Team Blue Score
                </Label>
                <input
                  id="team1Score"
                  type="number"
                  value={team1Score}
                  onChange={(e) => setTeam1Score(e.target.value)}
                  placeholder="Enter Team Blue score"
                  min="0"
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 p-2 text-zinc-100 placeholder-zinc-500"
                />
              </div>
              <div>
                <Label
                  htmlFor="team2Score"
                  className="mb-1 block text-zinc-300"
                >
                  Team Orange Score
                </Label>
                <input
                  id="team2Score"
                  type="number"
                  value={team2Score}
                  onChange={(e) => setTeam2Score(e.target.value)}
                  placeholder="Enter Team Orange score"
                  min="0"
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 p-2 text-zinc-100 placeholder-zinc-500"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <Button
                onClick={handleScoreSubmit}
                className="rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-2 text-zinc-200 transition-colors duration-200 hover:bg-zinc-700"
              >
                Submit Scores
              </Button>
            </div>
            <DialogClose asChild>
              <button className="absolute right-2 top-2 text-zinc-400 hover:text-zinc-100">
                <X className="h-4 w-4" />
              </button>
            </DialogClose>
          </DialogContent>
        </Dialog>
      </div>
    </Container>
  );
};

export default TeamPicker;
