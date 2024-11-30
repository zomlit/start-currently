import React, { useState, useEffect, useCallback, useReducer } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { TeamPickerProps, Player, Captain } from '../types/team-picker';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  X, Users, ChevronUp, ChevronDown, ArrowUpDown, ArrowDown, 
  ArrowUp, Check, Paintbrush, ImageIcon, 
  Trophy, Gamepad2, Medal, Settings2, 
  ChevronDown as ChevronDownIcon,
  Save, FolderOpen, Plus
} from 'lucide-react';
import * as Switch from '@radix-ui/react-switch';
import * as Label from '@radix-ui/react-label';
import * as Separator from '@radix-ui/react-separator';
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import * as Tooltip from '@radix-ui/react-tooltip';
import * as ContextMenu from '@radix-ui/react-context-menu';
import * as Dialog from '@radix-ui/react-dialog';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import {
  DraggableProvided,
  DroppableProvided,
  DraggableStateSnapshot,
  DroppableStateSnapshot
} from 'react-beautiful-dnd';
import { 
  ROCKET_LEAGUE_RANKS, 
  RANK_IMAGES, 
  getRankColor,
  RANK_ORDER
} from '../utils/rankUtils';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { colorThemes } from '../utils/colorThemes';
import type { ThemePreset } from '../types/team-picker';
import StatsSection from './team-picker/stats-section';
import SettingsSection from './team-picker/settings-section';
import BracketsSection from './team-picker/brackets-section';
import { useAuth } from "@clerk/tanstack-start";
import { supabase } from "@/utils/supabase/client";
import { toast } from "@/utils/toast";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SaveLoadSection } from './team-picker/save-load-section';

const getDroppableStyle = (isDraggingOver: boolean) => ({
  background: isDraggingOver ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
  transition: 'background-color 0.2s ease',
});

const getDraggableStyle = (isDragging: boolean, draggableStyle: any) => ({
  ...draggableStyle,
  userSelect: 'none',
  opacity: isDragging ? 0.5 : 1,
  transform: isDragging ? draggableStyle.transform : 'translate(0, 0)',
  cursor: isDragging ? 'grabbing' : 'grab',
});

const CustomButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'default' | 'ghost';
    size?: 'default' | 'icon';
  }
>(({ className, variant = 'default', size = 'default', ...props }, ref) => {
  const baseStyles = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400 disabled:pointer-events-none disabled:opacity-50";
  const variants = {
    default: "bg-blue-600 text-white hover:bg-blue-700",
    ghost: "hover:bg-zinc-700/50"
  };
  const sizes = {
    default: "h-9 px-4 py-2",
    icon: "h-8 w-8"
  };

  return (
    <button
      ref={ref}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    />
  );
});
CustomButton.displayName = 'CustomButton';

const areAllTeamsFull = (teams: Captain[], size: number) => {
  return teams.every(team => team.players.length === size);
};

// Add these style helpers at the top
const getItemStyle = (isDragging: boolean, isDisabled: boolean = false) => `
  flex items-center justify-between p-3 rounded-md border 
  ${isDragging ? 'border-blue-500 shadow-lg scale-[1.02]' : 'border-zinc-600/50'}
  ${isDragging ? 'bg-zinc-800' : 'bg-zinc-700/50'}
  ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-zinc-600/50 hover:border-zinc-500/50 cursor-grab active:cursor-grabbing'}
  transition-all duration-200
  group
`;

const getTeamHeaderStyle = (isComplete: boolean) => `
  text-lg font-semibold text-white cursor-pointer hover:text-zinc-300 flex items-center gap-2
  ${isComplete ? 'text-green-400' : ''}
  transition-colors
`;

// Add these helper functions at the top
const generateRandomName = () => {
  const firstNames = ['Alex', 'Sam', 'Jordan', 'Taylor', 'Casey', 'Riley', 'Morgan', 'Avery', 'Quinn', 'Skyler'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
  return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
};

// Add this helper function
const teamHasCaptain = (team: Captain) => {
  return team.players.some(player => player.isCaptain);
};

// Add this helper function near the top of the file
const generateRandomDarkColor = () => {
  // Generate random HSL values
  const hue = Math.floor(Math.random() * 360); // Full hue range
  const saturation = 30 + Math.floor(Math.random() * 20); // 30-50% saturation
  const lightness = 15 + Math.floor(Math.random() * 10); // 15-25% lightness
  const alpha = 0.3 + Math.random() * 0.2; // 0.3-0.5 alpha
  
  return {
    background: `hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha})`,
    border: `hsla(${hue}, ${saturation}%, ${Math.min(lightness + 10, 35)}%, ${Math.min(alpha + 0.2, 0.7)})`
  };
};

// Add these interfaces near the top of the file, after the imports
interface PlayerCardProps {
  player: Player;
  index: number;
  isDragging: boolean;
  style: React.CSSProperties;
  isCaptain?: boolean;
  onRankChange?: (playerId: string, newRank: string) => void;
  showRanks?: boolean;
}

interface TeamPlayerCardProps {
  player: Player;
  index: number;
  team: Captain;
  isDragging: boolean;
  style: React.CSSProperties;
  onRankChange?: (playerId: string, newRank: string) => void;
  showRanks?: boolean;
}

// Add this interface near the top with the other interfaces
interface RankSelectProps {
  value: string;
  onChange: (newRank: string) => void;
  color?: string;
}

// Update the RankSelect component
const RankSelect: React.FC<RankSelectProps> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedRank = ROCKET_LEAGUE_RANKS.find(
    (rank) => rank.name === value
  ) || {
    name: value,
    iconUrl: RANK_IMAGES[value as keyof typeof RANK_IMAGES],
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div className="flex flex-col items-center gap-[1px] cursor-pointer hover:opacity-80 transition-opacity">
          <img
            src={selectedRank.iconUrl}
            alt={selectedRank.name}
            className="w-8 h-8 object-contain"
            onError={(e) => {
              e.currentTarget.src = RANK_IMAGES.B1;
            }}
            loading="lazy"
          />
          <div 
            className="px-1.5 text-[10px] font-bold text-white rounded leading-none py-0.5"
            style={{ backgroundColor: getRankColor(value) + 'E6' }}
          >
            {value}
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent 
        className="p-2 bg-zinc-800 border border-zinc-700 shadow-lg shadow-black/50" 
        align="end"
        sideOffset={5}
      >
        <ScrollArea className="h-[400px]">
          <div className="grid grid-cols-4 gap-1.5 pr-4">
            {ROCKET_LEAGUE_RANKS.map((rank) => (
              <button
                key={rank.name}
                onClick={() => {
                  onChange(rank.name);
                  setIsOpen(false);
                }}
                className={`flex flex-col items-center gap-1 p-2 rounded-md text-center
                  ${value === rank.name 
                    ? 'bg-zinc-700 text-zinc-100' 
                    : 'text-zinc-300 hover:bg-zinc-700/50'
                  } transition-colors group relative`}
              >
                <img
                  src={rank.iconUrl}
                  alt={rank.name}
                  className="h-8 w-8 transition-transform group-hover:scale-110"
                />
                <span className="text-xs font-medium truncate w-full px-1">
                  {rank.name}
                </span>
                {value === rank.name && (
                  <div 
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-full rounded-full mt-1"
                    style={{ backgroundColor: getRankColor(rank.name) }}
                  />
                )}
              </button>
            ))}
          </div>
          <ScrollBar orientation="vertical" />
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

// Replace the existing slideInAnimation with fadeInAnimation
const fadeInAnimation = `
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

// Update the StyleTag component
const StyleTag = () => (
  <style>
    {fadeInAnimation}
  </style>
);

// Update the PlayerCard component's style
const PlayerCard: React.FC<PlayerCardProps & { 
  onRemove?: (id: string) => void;
  showRanks?: boolean;
}> = ({ 
  player, 
  index, 
  isDragging, 
  style, 
  isCaptain = false, 
  onRemove, 
  onRankChange,
  showRanks = true 
}) => (
  <div
    className={`
      flex items-center justify-between p-3 rounded-md border 
      transition-all duration-200 transform-gpu
      ${isDragging ? 'shadow-lg scale-[1.02] z-50' : ''}
    `}
    style={{
      ...style,
      backgroundColor: player.backgroundColor,
      borderColor: player.borderColor,
      animation: 'fadeIn 0.3s ease-out forwards',
      animationDelay: `${index * 0.05}s`,
      transformOrigin: 'center',
    }}
  >
    <div className="flex items-center gap-2">
      <div 
        className={`
          transition-all duration-300 ease-in-out
          ${showRanks 
            ? 'w-auto opacity-100 mr-2' 
            : 'w-0 opacity-0 mr-0'
          } overflow-hidden
        `}
      >
        <RankSelect
          value={player.abbreviatedRank || "Unknown"}
          onChange={(newRank) => {
            onRankChange && onRankChange(player.id, newRank);
          }}
        />
      </div>
      <span className="text-zinc-100">
        {isCaptain && '👑 '}{player.name}
      </span>
    </div>
    {onRemove && (
      <CustomButton
        variant="ghost"
        size="icon"
        onClick={(e) => {
          e.stopPropagation();
          onRemove(player.id);
        }}
        className="h-8 w-8 text-zinc-400 hover:text-red-400 hover:bg-red-400/10"
      >
        <X className="h-4 w-4" />
      </CustomButton>
    )}
  </div>
);

// Update the TeamPlayerCard component's style
const TeamPlayerCard: React.FC<TeamPlayerCardProps & { 
  onRemove?: (player: Player, teamId: string) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onRankChange?: (playerId: string, newRank: string) => void;
  showRanks?: boolean;
}> = ({ 
  player, 
  index, 
  team, 
  isDragging, 
  style, 
  onRemove, 
  onMoveUp, 
  onMoveDown, 
  onRankChange,
  showRanks = true
}) => (
  <div
    className={`
      relative rounded-md border overflow-hidden group 
      transition-all duration-200 transform-gpu
      ${isDragging ? 'shadow-lg scale-[1.02] z-50' : ''}
    `}
    style={{
      ...style,
      backgroundColor: player.backgroundColor,
      borderColor: player.borderColor,
      animation: 'fadeIn 0.3s ease-out forwards',
      animationDelay: `${index * 0.05}s`,
      transformOrigin: 'center',
    }}
  >
    <div className="transition-all duration-200 group-hover:pb-10">
      <div className="p-3">
        <div className="flex items-center gap-2">
          <div 
            className={`
              transition-all duration-300 ease-in-out
              ${showRanks 
                ? 'w-auto opacity-100 mr-2' 
                : 'w-0 opacity-0 mr-0'
              } overflow-hidden
            `}
          >
            <RankSelect
              value={player.abbreviatedRank || "Unknown"}
              onChange={(newRank) => {
                onRankChange && onRankChange(player.id, newRank);
              }}
            />
          </div>
          <span className="text-zinc-100">
            {index === 0 && '👑 '}{player.name}
          </span>
        </div>
      </div>
      
      {/* Controls container */}
      <div className="absolute left-0 right-0 bottom-0 flex items-stretch
        opacity-0 translate-y-full group-hover:translate-y-0 group-hover:opacity-100
        transition-all duration-200"
      >
        {!player.isCaptain && (
          <>
            <CustomButton
              variant="ghost"
              size="icon"
              onClick={onMoveUp}
              disabled={index === 0}
              className="flex-1 h-8 text-zinc-400 hover:text-blue-400 disabled:opacity-50 disabled:hover:text-zinc-400 rounded-none border-r border-zinc-600/50"
            >
              <ChevronUp className="h-4 w-4" />
            </CustomButton>
            <CustomButton
              variant="ghost"
              size="icon"
              onClick={onMoveDown}
              disabled={index === team.players.length - 1}
              className="flex-1 h-8 text-zinc-400 hover:text-blue-400 disabled:opacity-50 disabled:hover:text-zinc-400 rounded-none border-r border-zinc-600/50"
            >
              <ChevronDown className="h-4 w-4" />
            </CustomButton>
          </>
        )}
        {onRemove && (
          <CustomButton
            variant="ghost"
            size="icon"
            onClick={() => onRemove(player, team.id)}
            className="flex-1 h-8 text-zinc-400 hover:text-red-400 hover:bg-red-400/10 rounded-none"
          >
            <X className="h-4 w-4" />
          </CustomButton>
        )}
      </div>
    </div>
  </div>
);

// Add these types near the top of the file
type SortOption = 'rank' | 'alphabetical';
type SortDirection = 'asc' | 'desc';

// Add this type near the top with other types
type PickerMode = 'tournament' | '6mans' | 'casual' | 'ranked' | 'custom' | 'standard';

// Add this interface for mode configuration
interface ModeConfig {
  id: PickerMode;
  label: string;
  description: string;
  icon: React.ReactNode;
  defaultTeams: number;
  defaultTeamSize: number;
  allowTeamSizeChange: boolean;
  allowTeamCountChange: boolean;
  features: {
    captains: boolean;
    ranks: boolean;
    teamLogos: boolean;
    autoAssign: boolean;
  };
}

// Add this constant for mode configurations
const PICKER_MODES: ModeConfig[] = [
  {
    id: 'tournament',
    label: 'Tournament',
    description: 'Create balanced teams for a tournament with captains and customizable team sizes',
    icon: <Trophy className="h-4 w-4" />,
    defaultTeams: 8,
    defaultTeamSize: 3,
    allowTeamSizeChange: true,
    allowTeamCountChange: true,
    features: {
      captains: true,
      ranks: true,
      teamLogos: true,
      autoAssign: true
    }
  },
  {
    id: '6mans',
    label: '6 Mans',
    description: 'Quick 3v3 matches with two teams and optional captains',
    icon: <Users className="h-4 w-4" />,
    defaultTeams: 2,
    defaultTeamSize: 3,
    allowTeamSizeChange: false,
    allowTeamCountChange: false,
    features: {
      captains: true,
      ranks: true,
      teamLogos: false,
      autoAssign: true
    }
  },
  {
    id: 'casual',
    label: 'Casual',
    description: 'Relaxed team creation without ranks or captains',
    icon: <Gamepad2 className="h-4 w-4" />,
    defaultTeams: 2,
    defaultTeamSize: 3,
    allowTeamSizeChange: true,
    allowTeamCountChange: true,
    features: {
      captains: false,
      ranks: false,
      teamLogos: true,
      autoAssign: true
    }
  },
  {
    id: 'ranked',
    label: 'Ranked',
    description: 'Competitive team creation with strict rank balancing',
    icon: <Medal className="h-4 w-4" />,
    defaultTeams: 2,
    defaultTeamSize: 3,
    allowTeamSizeChange: false,
    allowTeamCountChange: false,
    features: {
      captains: false,
      ranks: true,
      teamLogos: false,
      autoAssign: true
    }
  },
  {
    id: 'custom',
    label: 'Custom',
    description: 'Fully customizable team creation with all features available',
    icon: <Settings2 className="h-4 w-4" />,
    defaultTeams: 1,
    defaultTeamSize: 3,
    allowTeamSizeChange: true,
    allowTeamCountChange: true,
    features: {
      captains: true,
      ranks: true,
      teamLogos: true,
      autoAssign: true
    }
  },
  {
    id: 'standard',
    label: 'Standard',
    description: 'Standard team creation with no special rules',
    icon: <Gamepad2 className="h-4 w-4" />,
    defaultTeams: 2,
    defaultTeamSize: 3,
    allowTeamSizeChange: true,
    allowTeamCountChange: true,
    features: {
      captains: false,
      ranks: false,
      teamLogos: false,
      autoAssign: true
    }
  }
];

// Add these types near the top of the file
interface SavedBracket {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  data: {
    players: Player[];
    teams: Captain[];
    settings: {
      numTeams: number;
      teamSize: number;
      showRanks: boolean;
      showTeamLogos: boolean;
      currentTheme: string;
      mode: string;
    };
  };
}

// Update the TeamPickerV2 component to include mode selection
const TeamPickerV2: React.FC<TeamPickerProps> = ({ initialState = null, isSharedView = false }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // Add these state declarations at the top
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Captain[]>([]);

  const [newName, setNewName] = useState('');
  const [numTeams, setNumTeams] = useState(8);
  const [teamSize, setTeamSize] = useState<number>(3);
  const MIN_TEAMS = 1;
  const [isAddingCaptain, setIsAddingCaptain] = useState(true);
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [editingTeamName, setEditingTeamName] = useState<string>('');
  const [captainSort, setCaptainSort] = useState<SortOption>('rank');
  const [playerSort, setPlayerSort] = useState<SortOption>('rank');
  const [captainSortDirection, setCaptainSortDirection] = useState<SortDirection>('desc');
  const [playerSortDirection, setPlayerSortDirection] = useState<SortDirection>('desc');
  const [editingTeamNumber, setEditingTeamNumber] = useState<{id: string, number: number} | null>(null);
  const [currentTheme, setCurrentTheme] = useState<ThemePreset>('random');
  const [showTeamLogos, setShowTeamLogos] = useState(false);
  const [isLogoSectionCollapsed, setIsLogoSectionCollapsed] = useState(false);
  const [showRanks, setShowRanks] = useState(true);
  // Add mode state
  const [currentMode, setCurrentMode] = useState<PickerMode>('tournament');
  const currentModeConfig = PICKER_MODES.find(mode => mode.id === currentMode)!;
  const { userId } = useAuth();

  // First, declare selectedBracketId state before using it
  const [selectedBracketId, setSelectedBracketId] = useState<string | null>(null);

  // Then update the teams query
  const { data: teamsList = [], isLoading: isLoadingTeams } = useQuery<Captain[]>({
    queryKey: ['teams'],
    initialData: () => {
      // Always generate empty teams on first load
      return Array.from({ length: numTeams }, (_, i) => {
        const teamNumber = i < Math.ceil(numTeams/2)
          ? i * 2 + 1  // Odd numbers (1,3,5,7)
          : (i - Math.ceil(numTeams/2)) * 2 + 2;  // Even numbers (2,4,6,8)
        return {
          id: `team-${Date.now()}-${i}`,
          name: `Team ${String(teamNumber).padStart(2, '0')}`,
          players: [],
        };
      });
    },
    enabled: true,
  });

  // Update the players query
  const { data: playersList = [], isLoading: isLoadingPlayers } = useQuery<Player[]>({
    queryKey: ['players'],
    initialData: [],
    enabled: true,
  });

  // Update the state setters to use the query data
  useEffect(() => {
    setPlayers(playersList);
  }, [playersList]);

  useEffect(() => {
    setTeams(teamsList);
  }, [teamsList]);

  // Update the updateTeamsMutation definition
  const updateTeamsMutation = useMutation({
    mutationFn: async (newTeams: Captain[]) => {
      // Update local state first
      const result = await Promise.resolve(newTeams);
      
      // Only update database if we have a selected bracket
      if (selectedBracketId) {
        const { error } = await supabase
          .from('Bracket')
          .update({
            data: {
              players,
              teams: newTeams,
              settings: {
                numTeams,
                teamSize,
                showRanks,
                showTeamLogos,
                currentTheme,
                mode: currentMode,
              }
            },
            updated_at: new Date().toISOString(),
          })
          .eq('id', selectedBracketId);

        if (error) {
          console.error('Error updating teams in Supabase:', error);
          throw error;
        }
      }
      
      return result;
    },
    onSuccess: (newTeams) => {
      // Only update the local query data
      queryClient.setQueryData(['teams'], newTeams);
      
      // If we have a selected bracket, invalidate the brackets query
      if (selectedBracketId) {
        queryClient.invalidateQueries({ queryKey: ['brackets'] });
      }
    },
  });

  // Add this query to load initial data
  const { data: brackets } = useQuery({
    queryKey: ['brackets', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('Bracket')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (error) {
        toast.error({ title: 'Error loading brackets' });
        return [];
      }

      return data as SavedBracket[];
    },
    enabled: !!userId,
    initialData: [],
    // Add this to prevent automatic refetching
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    console.log('Current players:', players);
  }, [players]);

  const addPlayerMutation = useMutation({
    mutationFn: async (newPlayer: Player) => {
      // First add to local state
      const result = await Promise.resolve(newPlayer);
      
      // Then save to Supabase
      const { error } = await supabase
        .from('Bracket')
        .insert([{
          user_id: userId,
          owner_id: userId,
          name: 'Team Picker',
          data: {
            players: [...players, newPlayer],
            teams: teams,
          },
          is_complete: false,
          updated_at: new Date().toISOString(),
        }]);

      if (error) {
        console.error('Error saving to Supabase:', error);
      }
      
      return result;
    },
    onSuccess: (newPlayer) => {
      queryClient.setQueryData(['players'], (oldPlayers: Player[] = []) => 
        [...oldPlayers, newPlayer]
      );
    },
  });

  const removePlayerMutation = useMutation({
    mutationFn: (playerId: string) => {
      return Promise.resolve(playerId);
    },
    onSuccess: (playerId) => {
      queryClient.setQueryData(['players'], (oldPlayers: Player[] = []) => 
        oldPlayers.filter(player => player.id !== playerId)
      );
    },
  });

  // Update the handleAddPlayer function to include rank information
  const handleAddPlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim()) {
      const colors = generatePlayerColors();
      // Use the first rank from ROCKET_LEAGUE_RANKS
      const defaultRank = ROCKET_LEAGUE_RANKS[ROCKET_LEAGUE_RANKS.length - 1]; // Gets B1 since array is reversed
      
      const newPlayer: Player = {
        id: `player-${Date.now()}`,
        name: newName.trim(),
        backgroundColor: colors.background,
        borderColor: colors.border,
        rank: defaultRank.name,
        abbreviatedRank: defaultRank.name, // The rank names in rankUtils are already abbreviated
        iconUrl: defaultRank.iconUrl,
        isCaptain: isAddingCaptain,
      };

      addPlayerMutation.mutate(newPlayer);
      setNewName('');
    }
  };

  const handleRemovePlayer = (playerId: string) => {
    if (window.confirm('Are you sure you want to remove this player?')) {
      // Find the player in the players list
      const player = players.find(p => p.id === playerId);
      if (!player) return;

      // Remove from players list
      queryClient.setQueryData(['players'], (oldPlayers: Player[] = []) => 
        oldPlayers.filter(p => p.id !== playerId)
      );
    }
  };

  // Update the handleUpdateNumTeams function
  const handleUpdateNumTeams = (newNum: number) => {
    if (isNaN(newNum)) return;
    
    setNumTeams(newNum);
    
    const currentTeams = [...teams];
    if (newNum > currentTeams.length) {
      // Add new teams with correct numbering
      for (let i = currentTeams.length; i < newNum; i++) {
        const teamNumber = i < Math.ceil(newNum/2)
          ? i * 2 + 1  // Odd numbers (1,3,5,7)
          : (i - Math.ceil(newNum/2)) * 2 + 2;  // Even numbers (2,4,6,8)
        currentTeams.push({
          id: `team-${Date.now()}-${i}`,
          name: `Team ${String(teamNumber).padStart(2, '0')}`,
          players: [],
        });
      }
    } else if (newNum < currentTeams.length) {
      if (newNum < MIN_TEAMS) {
        setNumTeams(MIN_TEAMS);
        return;
      }
      
      const removedPlayers: Player[] = [];
      currentTeams.slice(newNum).forEach(team => {
        removedPlayers.push(...team.players);
      });
      
      if (removedPlayers.length > 0) {
        const updatedPlayers = [...players, ...removedPlayers];
        queryClient.setQueryData(['players'], updatedPlayers);
      }
      
      currentTeams.splice(newNum);
    }
    
    updateTeamsMutation.mutate(currentTeams);
  };

  const handleRemoveCaptainFromTeam = (captain: Player, teamId: string) => {
    if (window.confirm('Are you sure you want to remove this captain?')) {
      // Add captain back to players pool
      const captainWithFlag = { ...captain, isCaptain: true };
      addPlayerMutation.mutate(captainWithFlag);

      // Remove captain from team and reset team name
      const updatedTeams = teams.map(team => {
        if (team.id === teamId) {
          // Find the index of this team to set the correct number
          const teamIndex = teams.findIndex(t => t.id === teamId);
          return {
            ...team,
            name: `Team ${teamIndex + 1}`, // Reset name to default
            players: team.players.filter(p => p.id !== captain.id)
          };
        }
        return team;
      });
      updateTeamsMutation.mutate(updatedTeams);
    }
  };

  // Update the formatTeamName function
  const formatTeamName = (name: string, maxLength: number = 25) => {
    // Remove any existing "Team " prefix to avoid duplication
    const cleanName = name.replace(/^Team\s+/i, '');
    // Always start with "Team"
    const fullName = `Team ${cleanName}`;
    return fullName.length > maxLength ? `${fullName.slice(0, maxLength)}...` : fullName;
  };

  // Add these functions near the other handlers
  const handleTeamNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditingTeamName(e.target.value);
  };

  const handleTeamNameDoubleClick = (team: Captain) => {
    setEditingTeamId(team.id);
    // Remove "Team " prefix when editing
    setEditingTeamName(team.name.replace(/^Team\s+/i, ''));
  };

  // Update the handleTeamNameSave function
  const handleTeamNameSave = () => {
    if (editingTeamId && editingTeamName.trim()) {
      const updatedTeams = teams.map(team => {
        if (team.id === editingTeamId) {
          // Remove "Team " prefix if it exists at the start of the input
          const nameWithoutPrefix = editingTeamName.trim().replace(/^Team\s+/i, '');
          return {
            ...team,
            name: formatTeamName(nameWithoutPrefix)
          };
        }
        return team;
      });
      updateTeamsMutation.mutate(updatedTeams);
      setEditingTeamId(null);
      setEditingTeamName('');
    }
  };

  const handleAddPlayerToTeam = (player: Player, teamId: string) => {
    const team = teams.find(t => t.id === teamId);
    if (!team || team.players.length >= teamSize) return;

    // Add player to team
    const updatedTeams = teams.map(t => {
      if (t.id === teamId) {
        return {
          ...t,
          players: [...t.players, player]
        };
      }
      return t;
    });
    updateTeamsMutation.mutate(updatedTeams);
    
    // Remove from players list
    removePlayerMutation.mutate(player.id);
    
    // Force update of team status
    queryClient.invalidateQueries({ queryKey: ['teams'] });
  };

  const handleRemovePlayerFromTeam = (player: Player, teamId: string) => {
    const team = teams.find(t => t.id === teamId);
    if (!team) return;

    const playerIndex = team.players.findIndex(p => p.id === player.id);
    const isCurrentCaptain = playerIndex === 0;

    const updatedTeams = teams.map(t => {
      if (t.id === teamId) {
        const remainingPlayers = t.players.filter(p => p.id !== player.id);
        
        if (remainingPlayers.length > 0 && isCurrentCaptain) {
          // Promote next player to captain
          const newCaptain = { ...remainingPlayers[0], isCaptain: true };
          const otherPlayers = remainingPlayers.slice(1);
          
          return {
            ...t,
            name: formatTeamName(newCaptain.name), // Use formatTeamName here
            players: [newCaptain, ...otherPlayers]
          };
        }
        
        return {
          ...t,
          name: remainingPlayers.length === 0 ? `Team ${teams.indexOf(t) + 1}` : t.name,
          players: remainingPlayers
        };
      }
      return t;
    });

    // Update teams
    updateTeamsMutation.mutate(updatedTeams);

    // Add player back to the appropriate list with correct captain status
    const playerToAdd = {
      ...player,
      isCaptain: isCurrentCaptain
    };

    // Update both states and force refresh
    queryClient.setQueryData(['teams'], updatedTeams);
    queryClient.setQueryData(['players'], (oldPlayers: Player[] = []) => [
      ...oldPlayers,
      playerToAdd
    ]);
    
    // Force update of team status
    queryClient.invalidateQueries({ queryKey: ['teams'] });
  };

  const handleMovePlayerBetweenTeams = (
    player: Player,
    sourceTeamId: string,
    destinationTeamId: string
  ) => {
    const destinationTeam = teams.find(t => t.id === destinationTeamId);
    if (!destinationTeam || destinationTeam.players.length >= teamSize) return;

    const updatedTeams = teams.map(team => {
      if (team.id === sourceTeamId) {
        return {
          ...team,
          players: team.players.filter(p => p.id !== player.id)
        };
      }
      if (team.id === destinationTeamId) {
        return {
          ...team,
          players: [...team.players, player]
        };
      }
      return team;
    });
    updateTeamsMutation.mutate(updatedTeams);
    
    // Force update of team status
    queryClient.invalidateQueries({ queryKey: ['teams'] });
  };

  const handleDragEnd = (result: DropResult) => {
    const { source, destination } = result;

    if (!destination) return;
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) return;

    // Create new references for state updates
    const newPlayers = [...players];
    const newTeams = teams.map(team => ({ ...team, players: [...team.players] })); // Deep clone teams

    // Get the moved player based on source
    let movedPlayer: Player | undefined;
    
    // Handle source
    if (source.droppableId.startsWith('team-')) {
      const sourceTeamId = source.droppableId.replace('team-', '');
      const sourceTeam = newTeams.find(t => t.id === sourceTeamId);
      if (!sourceTeam) return;
      
      movedPlayer = { ...sourceTeam.players[source.index] };
      
      // Remove from source team
      const sourceTeamIndex = newTeams.findIndex(t => t.id === sourceTeamId);
      if (sourceTeamIndex !== -1) {
        // If removing captain, promote next player
        if (source.index === 0 && sourceTeam.players.length > 1) {
          const newCaptain = { ...sourceTeam.players[1], isCaptain: true };
          const otherPlayers = sourceTeam.players.slice(2);
          newTeams[sourceTeamIndex] = {
            ...sourceTeam,
            name: `${newCaptain.name}'s Team`,
            players: [newCaptain, ...otherPlayers]
          };
        } else {
          newTeams[sourceTeamIndex].players = sourceTeam.players.filter(
            p => p.id !== movedPlayer!.id
          );
        }
      }
    } else {
      // Handle players/captains list source
      const playersList = source.droppableId === 'captains' 
        ? getSortedPlayers(players.filter(p => p.isCaptain), captainSort, captainSortDirection)
        : getSortedPlayers(players.filter(p => !p.isCaptain), playerSort, playerSortDirection);
      
      movedPlayer = { ...playersList[source.index] };
      
      // Remove from players list
      const playerIndex = newPlayers.findIndex(p => p.id === movedPlayer?.id);
      if (playerIndex !== -1) {
        newPlayers.splice(playerIndex, 1);
      }
    }

    if (!movedPlayer) return;

    // Handle destination
    if (destination.droppableId.startsWith('team-')) {
      const teamId = destination.droppableId.replace('team-', '');
      const team = newTeams.find(t => t.id === teamId);
      if (!team || team.players.length >= teamSize) return;

      // Update player's captain status based on destination position
      const shouldBeCaptain = team.players.length === 0;
      const wasRegularPlayer = !movedPlayer.isCaptain;
      
      // Update player status
      movedPlayer = {
        ...movedPlayer,
        isCaptain: shouldBeCaptain
      };

      // Add to destination team
      const destTeamIndex = newTeams.findIndex(t => t.id === teamId);
      if (destTeamIndex !== -1) {
        if (shouldBeCaptain) {
          // If a regular player becomes a captain, we need to update the counts
          if (wasRegularPlayer) {
            // Update the available slots calculations
            const regularPlayersCount = players.filter(p => !p.isCaptain).length;
            const captainsCount = players.filter(p => p.isCaptain).length;
            
            // Force update of the counts
            queryClient.setQueryData(['playerCounts'], {
              regularPlayers: regularPlayersCount - 1, // One less regular player
              captains: captainsCount + 1 // One more captain
            });
          }

          newTeams[destTeamIndex] = {
            ...team,
            name: `${movedPlayer.name}'s Team`,
            players: [movedPlayer]
          };
        } else {
          newTeams[destTeamIndex].players = [...team.players, movedPlayer];
        }
      }
    } else {
      // Moving back to players/captains list
      const wasTeamCaptain = source.droppableId.startsWith('team-') && source.index === 0;
      movedPlayer.isCaptain = wasTeamCaptain || destination.droppableId === 'captains';
      newPlayers.push(movedPlayer);
    }

    // Update states with new references to trigger re-render
    queryClient.setQueryData(['teams'], newTeams);
    queryClient.setQueryData(['players'], newPlayers);

    // Force immediate update of all counts
    requestAnimationFrame(() => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      queryClient.invalidateQueries({ queryKey: ['playerCounts'] });
    });
  };

  const handleTeamSizeChange = (newSize: number) => {
    const size = Math.min(Math.max(1, newSize), 4); // Clamp between 1 and 4
    setTeamSize(size);
  };

  // Add this function to the component
  const handlePopulate = () => {
    // Clear existing players and captains
    queryClient.setQueryData(['players'], []);

    // Calculate how many players we need total
    const totalPlayersNeeded = numTeams * teamSize;
    const captainsNeeded = numTeams;
    const playersNeeded = totalPlayersNeeded - captainsNeeded;

    const getRandomRank = () => {
      const randomIndex = Math.floor(Math.random() * ROCKET_LEAGUE_RANKS.length);
      const rank = ROCKET_LEAGUE_RANKS[randomIndex];
      return {
        name: rank.name,
        iconUrl: rank.iconUrl
      };
    };

    const newCaptains = Array.from({ length: captainsNeeded }, () => {
      const colors = generatePlayerColors();
      const rank = getRandomRank();
      return {
        id: `player-${Date.now()}-${Math.random()}`,
        name: generateRandomName(),
        backgroundColor: colors.background,
        borderColor: colors.border,
        rank: rank.name,
        abbreviatedRank: rank.name,
        iconUrl: rank.iconUrl,
        isCaptain: true,
      };
    });

    const newPlayers = Array.from({ length: playersNeeded }, () => {
      const colors = generatePlayerColors();
      const rank = getRandomRank();
      return {
        id: `player-${Date.now()}-${Math.random()}`,
        name: generateRandomName(),
        backgroundColor: colors.background,
        borderColor: colors.border,
        rank: rank.name,
        abbreviatedRank: rank.name,
        iconUrl: rank.iconUrl,
        isCaptain: false,
      };
    });

    // Update the players list with both captains and players
    queryClient.setQueryData(['players'], [...newCaptains, ...newPlayers]);
  };

  // Add this function to handle player reordering and captain promotion
  const handleReorderPlayer = (teamId: string, currentIndex: number, direction: 'up' | 'down') => {
    const team = teams.find(t => t.id === teamId);
    if (!team) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= team.players.length) return;

    const updatedTeams = teams.map(t => {
      if (t.id === teamId) {
        const newPlayers = [...t.players];
        const [movedPlayer] = newPlayers.splice(currentIndex, 1);
        newPlayers.splice(newIndex, 0, movedPlayer);

        // If player is moved to first position, they become captain
        if (newIndex === 0) {
          newPlayers[0] = { ...newPlayers[0], isCaptain: true };
          newPlayers[1] = { ...newPlayers[1], isCaptain: false };
          return {
            ...t,
            name: formatTeamName(newPlayers[0].name), // Updated
            players: newPlayers
          };
        }

        return {
          ...t,
          players: newPlayers
        };
      }
      return t;
    });

    updateTeamsMutation.mutate(updatedTeams);
  };

  // Add this mutation inside the TeamPickerV2 component
  const updatePlayerRankMutation = useMutation({
    mutationFn: (updates: { playerId: string; newRank: string }) => {
      return Promise.resolve(updates);
    },
    onSuccess: ({ playerId, newRank }) => {
      // Update players list
      queryClient.setQueryData(['players'], (oldPlayers: Player[] = []) =>
        oldPlayers.map(player =>
          player.id === playerId
            ? {
                ...player,
                rank: newRank,
                abbreviatedRank: newRank,
                iconUrl: RANK_IMAGES[newRank as keyof typeof RANK_IMAGES],
              }
            : player
        )
      );

      // Update teams list
      queryClient.setQueryData(['teams'], (oldTeams: Captain[] = []) =>
        oldTeams.map(team => ({
          ...team,
          players: team.players.map(player =>
            player.id === playerId
              ? {
                  ...player,
                  rank: newRank,
                  abbreviatedRank: newRank,
                  iconUrl: RANK_IMAGES[newRank as keyof typeof RANK_IMAGES],
                }
              : player
          ),
        }))
      );
    },
  });

  // Add this handler function
  const handleRankChange = (playerId: string, newRank: string) => {
    updatePlayerRankMutation.mutate({ playerId, newRank });
  };

  // Update the sort functions
  const sortByRank = (a: Player, b: Player, direction: SortDirection) => {
    const rankA = RANK_ORDER.indexOf(a.abbreviatedRank || 'B1');
    const rankB = RANK_ORDER.indexOf(b.abbreviatedRank || 'B1');
    return direction === 'desc' ? rankB - rankA : rankA - rankB;
  };

  const sortAlphabetically = (a: Player, b: Player, direction: SortDirection) => {
    return direction === 'desc' 
      ? b.name.localeCompare(a.name)
      : a.name.localeCompare(b.name);
  };

  const getSortedPlayers = (players: Player[], sortType: SortOption, direction: SortDirection) => {
    return [...players].sort((a, b) => 
      sortType === 'rank' 
        ? sortByRank(a, b, direction)
        : sortAlphabetically(a, b, direction)
    );
  };

  // Update the handleTeamNumberChange function
  const handleTeamNumberChange = (teamId: string, newNumber: number) => {
    // Get the current team
    const currentTeam = teams.find(t => t.id === teamId);
    if (!currentTeam) return;

    // Calculate the current team's number based on its position
    const currentIndex = teams.indexOf(currentTeam);
    const currentNumber = parseInt(getTeamNumber(currentIndex, teams.length));

    // Find the target team index based on the new number
    let targetIndex;
    if (newNumber % 2 === 1) { // Odd number
      targetIndex = Math.floor((newNumber - 1) / 2);
    } else { // Even number
      targetIndex = Math.floor(teams.length / 2) + Math.floor((newNumber - 2) / 2);
    }

    // Create a copy of teams array
    const updatedTeams = [...teams];
    
    // Swap the teams
    const temp = updatedTeams[currentIndex];
    updatedTeams[currentIndex] = updatedTeams[targetIndex];
    updatedTeams[targetIndex] = temp;

    // Update teams
    updateTeamsMutation.mutate(updatedTeams);
    setEditingTeamNumber(null);
  };

  // Add these helper functions near the top of the component
  const calculateTotalPlayersInTeams = (teams: Captain[]) => {
    return teams.reduce((total, team) => total + team.players.length, 0);
  };

  const calculateRequiredPlayers = (numTeams: number, teamSize: number) => {
    return numTeams * teamSize;
  };

  // Add this helper function to calculate available player slots
  const calculateAvailablePlayerSlots = (teams: Captain[], numTeams: number, teamSize: number) => {
    // Calculate total regular player slots (non-captain slots)
    const totalRegularSlots = numTeams * (teamSize - 1); // Subtract 1 for captain slot per team
    
    // Count current regular players in teams (excluding captains)
    const currentRegularPlayers = teams.reduce((total, team) => {
      // Count all players except the captain (first player)
      return total + (team.players.length > 0 ? team.players.length - 1 : 0);
    }, 0);

    // Return remaining available slots
    return totalRegularSlots - currentRegularPlayers;
  };

  // Add this helper function to calculate available captain slots
  const calculateAvailableCaptainSlots = (teams: Captain[], numTeams: number) => {
    // Count teams that don't have a captain (empty teams)
    const teamsWithoutCaptain = teams.filter(team => team.players.length === 0).length;
    return teamsWithoutCaptain;
  };

  // Update the player counting functions
  const calculatePlayerCounts = () => {
    // Count captains (both in pool and in teams)
    const captainsInPool = players.filter(p => p.isCaptain).length;
    const captainsInTeams = teams.reduce((count, team) => 
      count + (team.players.length > 0 && team.players[0].isCaptain ? 1 : 0), 0
    );
    const totalCaptains = captainsInPool + captainsInTeams;

    // Count regular players (both in pool and in teams)
    const regularPlayersInPool = players.filter(p => !p.isCaptain).length;
    const regularPlayersInTeams = teams.reduce((count, team) => 
      count + team.players.filter((_, index) => index > 0).length, 0
    );
    const totalRegularPlayers = regularPlayersInPool + regularPlayersInTeams;

    // Total players
    const totalPlayers = totalCaptains + totalRegularPlayers;

    return {
      captains: {
        inPool: captainsInPool,
        inTeams: captainsInTeams,
        total: totalCaptains
      },
      regularPlayers: {
        inPool: regularPlayersInPool,
        inTeams: regularPlayersInTeams,
        total: totalRegularPlayers
      },
      total: totalPlayers
    };
  };

  // Update the stats calculations
  const playerCounts = calculatePlayerCounts();
  const totalPlayersInTeams = teams.reduce((sum, team) => sum + team.players.length, 0);
  const totalPlayers = playerCounts.total;
  const requiredPlayers = calculateRequiredPlayers(numTeams, teamSize);

  // Update calculateNeededCounts function
  const calculateNeededCounts = (teams: Captain[], numTeams: number, teamSize: number, players: Player[]) => {
    const counts = calculatePlayerCounts();
    
    // Calculate how many captains are still needed
    const captainsNeeded = numTeams - counts.captains.total;
    
    // Calculate total players needed
    const totalSlotsNeeded = numTeams * teamSize;
    const totalPlayersNeeded = totalSlotsNeeded - counts.total;
    
    // Calculate regular players needed (excluding captain slots)
    const regularPlayersNeeded = Math.max(0, totalPlayersNeeded - captainsNeeded);

    return {
      captainsNeeded: Math.max(0, captainsNeeded),
      regularPlayersNeeded,
      totalNeeded: totalPlayersNeeded,
      captainsTotal: counts.captains.total,
      regularPlayersTotal: counts.regularPlayers.total
    };
  };

  // Add this helper function to calculate team size status
  const calculateTeamStatus = (team: Captain) => {
    return {
      current: team.players.length,
      required: teamSize,
      isComplete: team.players.length === teamSize,
      isFull: team.players.length >= teamSize
    };
  };

  // Add this function to generate player colors
  const generatePlayerColors = () => {
    const theme = colorThemes[currentTheme];
    return theme.generateColors();
  };

  // Update the autoAssignCaptains function
  const autoAssignCaptains = () => {
    // Get available captains from pool
    const availableCaptains = [...players].filter(p => p.isCaptain);
    
    if (availableCaptains.length === 0) {
      return;
    }

    // Sort captains by rank (highest to lowest)
    const sortedCaptains = [...availableCaptains].sort((a, b) => {
      const rankA = RANK_ORDER.indexOf(a.abbreviatedRank || 'B1');
      const rankB = RANK_ORDER.indexOf(b.abbreviatedRank || 'B1');
      return rankB - rankA; // Higher ranks first
    });

    // Find empty teams
    const emptyTeams = teams.filter(team => team.players.length === 0);
    
    if (emptyTeams.length === 0) {
      return;
    }

    // Create new teams array
    const updatedTeams = [...teams];
    let assignedCount = 0;

    // Assign captains to empty teams, distributing ranks evenly
    emptyTeams.forEach((team, index) => {
      if (index < sortedCaptains.length) {
        const captain = sortedCaptains[index];
        const teamIndex = updatedTeams.findIndex(t => t.id === team.id);
        
        if (teamIndex !== -1) {
          updatedTeams[teamIndex] = {
            ...team,
            name: formatTeamName(captain.name),
            players: [{ ...captain, isCaptain: true }]
          };
          assignedCount++;
        }
      }
    });

    // Update teams locally
    updateTeamsMutation.mutate(updatedTeams);

    // If we have a selected bracket, update it in the database
    if (selectedBracketId) {
      supabase
        .from('Bracket')
        .update({
          data: {
            players: players.filter(p => 
              !sortedCaptains.slice(0, assignedCount).find(c => c.id === p.id)
            ),
            teams: updatedTeams,
            settings: {
              numTeams,
              teamSize,
              showRanks,
              showTeamLogos,
              currentTheme,
              mode: currentMode,
            }
          },
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedBracketId)
        .then(({ error }) => {
          if (error) {
            console.error('Error updating bracket:', error);
            toast.error({ title: 'Error updating bracket' });
          } else {
            queryClient.invalidateQueries({ queryKey: ['brackets'] });
          }
        });
    }

    // Remove assigned captains from pool
    const remainingCaptains = players.filter(p => 
      p.isCaptain && !sortedCaptains.slice(0, assignedCount).find(c => c.id === p.id)
    );
    const nonCaptains = players.filter(p => !p.isCaptain);
    queryClient.setQueryData(['players'], [...remainingCaptains, ...nonCaptains]);
  };

  // Update the autoAssignPlayers function
  const autoAssignPlayers = () => {
    // Get available regular players from pool
    const availablePlayers = [...players].filter(p => !p.isCaptain);
    
    if (availablePlayers.length === 0) {
      return;
    }

    // Sort players by rank (highest to lowest)
    const sortedPlayers = [...availablePlayers].sort((a, b) => {
      const rankA = RANK_ORDER.indexOf(a.abbreviatedRank || 'B1');
      const rankB = RANK_ORDER.indexOf(b.abbreviatedRank || 'B1');
      return rankB - rankA;
    });

    // Find teams that have a captain but aren't full
    const incompleteTeams = teams
      .filter(team => team.players.length > 0 && team.players.length < teamSize)
      .sort((a, b) => {
        // Sort by team size first (fill smallest teams first)
        const sizeCompare = a.players.length - b.players.length;
        if (sizeCompare !== 0) return sizeCompare;

        // If same size, sort by average team rank
        const avgRankA = getAverageTeamRank(a);
        const avgRankB = getAverageTeamRank(b);
        return avgRankA - avgRankB; // Lower average rank gets players first
      });

    if (incompleteTeams.length === 0) {
      return;
    }

    // Create new teams array
    const updatedTeams = [...teams];
    const assignedPlayers: Player[] = [];

    // Distribute players to balance team ranks
    while (sortedPlayers.length > 0 && incompleteTeams.some(team => team.players.length < teamSize)) {
      // Sort teams by current strength after each assignment
      incompleteTeams.sort((a, b) => {
        const avgRankA = getAverageTeamRank(a);
        const avgRankB = getAverageTeamRank(b);
        return avgRankA - avgRankB;
      });

      for (const team of incompleteTeams) {
        if (sortedPlayers.length === 0) break;
        if (team.players.length < teamSize) {
          const teamIndex = updatedTeams.findIndex(t => t.id === team.id);
          if (teamIndex !== -1) {
            // Get the next player
            const player = sortedPlayers.shift()!;
            updatedTeams[teamIndex].players.push(player);
            assignedPlayers.push(player);
          }
        }
      }
    }

    // Update teams locally
    updateTeamsMutation.mutate(updatedTeams);

    // If we have a selected bracket, update it in the database
    if (selectedBracketId) {
      supabase
        .from('Bracket')
        .update({
          data: {
            players: players.filter(p => 
              !assignedPlayers.find(ap => ap.id === p.id)
            ),
            teams: updatedTeams,
            settings: {
              numTeams,
              teamSize,
              showRanks,
              showTeamLogos,
              currentTheme,
              mode: currentMode,
            }
          },
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedBracketId)
        .then(({ error }) => {
          if (error) {
            console.error('Error updating bracket:', error);
            toast.error({ title: 'Error updating bracket' });
          } else {
            queryClient.invalidateQueries({ queryKey: ['brackets'] });
          }
        });
    }

    // Update players pool with remaining players
    const captains = players.filter(p => p.isCaptain);
    const remainingPlayers = sortedPlayers;
    queryClient.setQueryData(['players'], [...captains, ...remainingPlayers]);
  };

  // Add this helper function for team rank calculation
  const getAverageTeamRank = (team: Captain) => {
    if (team.players.length === 0) return RANK_ORDER.length - 1; // Lowest possible rank
    
    const totalRank = team.players.reduce((sum, player) => {
      const rankIndex = RANK_ORDER.indexOf(player.abbreviatedRank || 'B1');
      return sum + rankIndex;
    }, 0);
    
    return totalRank / team.players.length;
  };

  // Add this helper function near the other helper functions
  const getRandomRank = () => {
    const randomIndex = Math.floor(Math.random() * ROCKET_LEAGUE_RANKS.length);
    const rank = ROCKET_LEAGUE_RANKS[randomIndex];
    return {
      name: rank.name,
      iconUrl: rank.iconUrl
    };
  };

  // Update the populate functions to use the new rank generation
  const handlePopulateCaptains = () => {
    // Clear existing captains
    queryClient.setQueryData(['players'], (oldPlayers: Player[] = []) => 
      oldPlayers.filter(p => !p.isCaptain)
    );

    // Generate new captains
    const captainsNeeded = numTeams;
    const newCaptains = Array.from({ length: captainsNeeded }, () => {
      const colors = generatePlayerColors();
      const rank = getRandomRank();
      return {
        id: `player-${Date.now()}-${Math.random()}`,
        name: generateRandomName(),
        backgroundColor: colors.background,
        borderColor: colors.border,
        rank: rank.name,
        abbreviatedRank: rank.name,
        iconUrl: rank.iconUrl,
        isCaptain: true,
      };
    });

    // Add new captains to players list
    queryClient.setQueryData(['players'], (oldPlayers: Player[] = []) => 
      [...oldPlayers, ...newCaptains]
    );
  };

  const handlePopulatePlayers = () => {
    // Clear existing regular players
    queryClient.setQueryData(['players'], (oldPlayers: Player[] = []) => 
      oldPlayers.filter(p => p.isCaptain)
    );

    // Generate new regular players
    const playersNeeded = (numTeams * teamSize) - numTeams; // Total slots minus captain slots
    const newPlayers = Array.from({ length: playersNeeded }, () => {
      const colors = generatePlayerColors();
      const rank = getRandomRank();
      return {
        id: `player-${Date.now()}-${Math.random()}`,
        name: generateRandomName(),
        backgroundColor: colors.background,
        borderColor: colors.border,
        rank: rank.name,
        abbreviatedRank: rank.name,
        iconUrl: rank.iconUrl,
        isCaptain: false,
      };
    });

    // Add new players to players list
    queryClient.setQueryData(['players'], (oldPlayers: Player[] = []) => 
      [...oldPlayers, ...newPlayers]
    );
  };

  // Update the helper function to check if actions are allowed
  const canPerformTeamActions = () => {
    // Check if we have any players or captains in the pool
    const hasAvailablePlayers = players.filter(p => !p.isCaptain).length > 0;
    const hasAvailableCaptains = players.filter(p => p.isCaptain).length > 0;
    
    return hasAvailablePlayers || hasAvailableCaptains;
  };

  // Add these helper functions to check if we have enough players/captains
  const isPlayersFull = () => {
    const counts = calculatePlayerCounts();
    const regularPlayersNeeded = calculateNeededCounts(teams, numTeams, teamSize, players).regularPlayersNeeded;
    return regularPlayersNeeded <= 0;
  };

  const isCaptainsFull = () => {
    const counts = calculatePlayerCounts();
    const captainsNeeded = calculateNeededCounts(teams, numTeams, teamSize, players).captainsNeeded;
    return captainsNeeded <= 0;
  };

  const isAllPlayersFull = () => {
    return isPlayersFull() && isCaptainsFull();
  };

  // Add this helper function near the other helper functions
  const showSingleTeamWarning = (numTeams: number) => {
    return numTeams <= 1;
  };

  // Update the getTeamNumber function to use the actual team index
  const getTeamNumber = (teamIndex: number, totalTeams: number) => {
    // For first column teams (0 to half)
    if (teamIndex < Math.ceil(totalTeams/2)) {
      return String(teamIndex * 2 + 1).padStart(2, '0');
    }
    // For second column teams (half to end)
    else {
      const adjustedIndex = teamIndex - Math.ceil(totalTeams/2);
      return String(adjustedIndex * 2 + 2).padStart(2, '0');
    }
  };

  // Replace or update the handleClearAll function
  const handleClearAll = () => {
    // Reset players
    queryClient.setQueryData(['players'], []);
    setPlayers([]);

    // Reset teams but keep structure
    const emptyTeams = Array.from({ length: numTeams }, (_, i) => {
      const teamNumber = i < Math.ceil(numTeams/2)
        ? i * 2 + 1  // Odd numbers (1,3,5,7)
        : (i - Math.ceil(numTeams/2)) * 2 + 2;  // Even numbers (2,4,6,8)
    
      return {
        id: `team-${Date.now()}-${i}`,
        name: `Team ${String(teamNumber).padStart(2, '0')}`,
        players: [],
      };
    });

    // Update teams state
    queryClient.setQueryData(['teams'], emptyTeams);
    setTeams(emptyTeams);

    // If we have a selected bracket, update it in the database
    if (selectedBracketId) {
      const currentBracket = brackets?.find(b => b.id === selectedBracketId);
      if (currentBracket) {
        // Use supabase directly to update the bracket
        supabase
          .from('Bracket')
          .update({
            data: {
              players: [],
              teams: emptyTeams,
              settings: {
                numTeams,
                teamSize,
                showRanks,
                showTeamLogos,
                currentTheme,
                mode: currentMode,
              }
            },
            updated_at: new Date().toISOString(),
          })
          .eq('id', selectedBracketId)
          .then(({ error }) => {
            if (error) {
              console.error('Error updating bracket:', error);
              toast.error({ title: 'Error updating bracket' });
            } else {
              queryClient.invalidateQueries({ queryKey: ['brackets'] });
              toast.success({ title: 'All lists cleared' });
            }
          });
      }
    } else {
      toast.success({ title: 'All lists cleared' });
    }
  };

  // Add mode change handler
  const handleModeChange = (newMode: PickerMode) => {
    const newConfig = PICKER_MODES.find(mode => mode.id === newMode)!;
    setCurrentMode(newMode);
    
    // Always reset to mode defaults when switching modes
    setNumTeams(newConfig.defaultTeams);
    setTeamSize(newConfig.defaultTeamSize);
    
    // Update other settings based on new mode
    setShowRanks(newConfig.features.ranks);
    setShowTeamLogos(newConfig.features.teamLogos);
    setIsAddingCaptain(newConfig.features.captains);

    // Update teams array with new team count
    const updatedTeams = Array.from({ length: newConfig.defaultTeams }, (_, i) => {
      const teamNumber = i < Math.ceil(newConfig.defaultTeams/2)
        ? i * 2 + 1  // Odd numbers (1,3,5,7)
        : (i - Math.ceil(newConfig.defaultTeams/2)) * 2 + 2;  // Even numbers (2,4,6,8)
      
      return {
        id: `team-${Date.now()}-${i}`,
        name: `Team ${String(teamNumber).padStart(2, '0')}`,
        players: [],
      };
    });

    // Update teams state through mutation
    updateTeamsMutation.mutate(updatedTeams);

    // Force refresh of team status
    queryClient.invalidateQueries({ queryKey: ['teams'] });
  };

  // Add this JSX right after the header section and before the settings section
  const modeSelector = (
    <div className="mb-6">
      <Popover>
        <PopoverTrigger asChild>
          <button className="w-full flex items-center justify-between px-4 py-2 rounded-lg bg-zinc-800/50 border border-zinc-700/50 hover:bg-zinc-700/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-zinc-700/50">
                {currentModeConfig.icon}
              </div>
              <div className="text-left">
                <div className="font-medium text-zinc-100">
                  {currentModeConfig.label}
                </div>
                <div className="text-sm text-zinc-400">
                  {currentModeConfig.description}
                </div>
              </div>
            </div>
            <ChevronDownIcon className="h-4 w-4 text-zinc-400" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0" align="start">
          <div className="p-2 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl">
            {PICKER_MODES.map((mode) => (
              <button
                key={mode.id}
                onClick={() => {
                  handleModeChange(mode.id);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors
                  ${currentMode === mode.id 
                    ? 'bg-blue-500/20 text-blue-400' 
                    : 'hover:bg-zinc-700/50 text-zinc-300'
                  }
                `}
              >
                <div className={`p-2 rounded-md ${
                  currentMode === mode.id 
                    ? 'bg-blue-500/20' 
                    : 'bg-zinc-700/50'
                }`}>
                  {mode.icon}
                </div>
                <div className="text-left">
                  <div className="font-medium">
                    {mode.label}
                  </div>
                  <div className="text-sm text-zinc-400">
                    {mode.description}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );

  // Add this to the TeamPickerV2 component
  const handleTeamsReorder = (newTeams: Captain[]) => {
    updateTeamsMutation.mutate(newTeams);
  };

  // Update where BracketsSection is used
  <BracketsSection
    mode={currentMode}
    teams={teams}
    numTeams={numTeams}
    teamSize={teamSize}
    showTeamLogos={showTeamLogos}
    onTeamsReorder={handleTeamsReorder}
  />

  // Add these state variables in the component
  const [savedBrackets, setSavedBrackets] = useState<SavedBracket[]>([]);
  const [isLoadDialogOpen, setIsLoadDialogOpen] = useState(false);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [newBracketName, setNewBracketName] = useState('');

  const saveBracketMutation = useMutation({
    mutationFn: async (name: string) => {
      if (!userId) throw new Error('Not authenticated');

      const bracketData = {
        players,
        teams,
        settings: {
          numTeams,
          teamSize,
          showRanks,
          showTeamLogos,
          currentTheme,
          mode: currentMode,
        },
      };

      const { data, error } = await supabase
        .from('Bracket')
        .insert([{
          user_id: userId,
          owner_id: userId,
          name,
          data: bracketData,
          is_complete: false,
          updated_at: new Date().toISOString(),
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Bracket saved successfully');
      setIsSaveDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['brackets'] });
    },
    onError: () => {
      toast.error('Error saving bracket');
    },
  });

  const loadBracketMutation = useMutation({
    mutationFn: async (bracketId: string) => {
      setSelectedBracketId(bracketId); // Set the selected bracket ID
      
      const { data, error } = await supabase
        .from('Bracket')
        .select('*')
        .eq('id', bracketId)
        .single();

      if (error) throw error;
      return data as SavedBracket;
    },
    onSuccess: (data) => {
      const { players: loadedPlayers, teams: loadedTeams, settings } = data.data;
      
      queryClient.setQueryData(['players'], loadedPlayers);
      queryClient.setQueryData(['teams'], loadedTeams);
      
      setNumTeams(settings.numTeams);
      setTeamSize(settings.teamSize);
      setShowRanks(settings.showRanks);
      setShowTeamLogos(settings.showTeamLogos);
      setCurrentTheme(settings.currentTheme as ThemePreset);
      setCurrentMode(settings.mode as PickerMode);
      
      setIsLoadDialogOpen(false);
      toast.success({ title: 'Bracket loaded successfully' });
    },
    onError: () => {
      setSelectedBracketId(null); // Reset on error
      toast.error({ title: 'Error loading bracket' });
    },
  });

  // Add these handler functions
  const handleSaveBracket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBracketName.trim()) {
      toast.error('Please enter a name for the bracket');
      return;
    }
    saveBracketMutation.mutate(newBracketName.trim());
  };

  const handleLoadBracket = useCallback((bracketData: any) => {
    console.log('Loading data:', bracketData);
    
    if (bracketData && typeof bracketData === 'object') {
      // Reset current state first
      queryClient.setQueryData(['players'], []);
      queryClient.setQueryData(['teams'], []);
      
      // Small delay to ensure state is cleared
      setTimeout(() => {
        if (Array.isArray(bracketData.players)) {
          queryClient.setQueryData(['players'], bracketData.players);
        }
        
        if (Array.isArray(bracketData.teams)) {
          queryClient.setQueryData(['teams'], bracketData.teams);
        }
        
        // Handle settings if they exist
        if (bracketData.settings) {
          if (typeof bracketData.settings.numTeams === 'number') setNumTeams(bracketData.settings.numTeams);
          if (typeof bracketData.settings.teamSize === 'number') setTeamSize(bracketData.settings.teamSize);
          if (typeof bracketData.settings.showRanks === 'boolean') setShowRanks(bracketData.settings.showRanks);
          if (typeof bracketData.settings.showTeamLogos === 'boolean') setShowTeamLogos(bracketData.settings.showTeamLogos);
          if (bracketData.settings.currentTheme) setCurrentTheme(bracketData.settings.currentTheme);
          if (bracketData.settings.mode) setCurrentMode(bracketData.settings.mode);
        }
      }, 100);
    }
  }, [queryClient]);

  // Add this JSX near the top of your return statement, perhaps in the header section
  const SaveLoadButtons = () => (
    <div className="flex items-center gap-2">
      {/* Save Dialog */}
      <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
        <DialogTrigger asChild>
          <Button 
            variant="outline" 
            className="gap-2"
            disabled={!userId}
          >
            <Save className="h-4 w-4" />
            Save
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Tournament</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveBracket} className="space-y-4">
            <div>
              <label htmlFor="bracketName" className="text-sm font-medium">
                Tournament Name
              </label>
              <Input
                id="bracketName"
                value={newBracketName}
                onChange={(e) => setNewBracketName(e.target.value)}
                placeholder="Enter tournament name..."
                className="mt-1"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsSaveDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!newBracketName.trim() || saveBracketMutation.isPending}
              >
                {saveBracketMutation.isPending ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Load Dialog */}
      <Dialog open={isLoadDialogOpen} onOpenChange={setIsLoadDialogOpen}>
        <DialogTrigger asChild>
          <Button 
            variant="outline" 
            className="gap-2"
            disabled={!userId}
          >
            <FolderOpen className="h-4 w-4" />
            Load
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Load Tournament</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {brackets?.length === 0 ? (
              <div className="text-center py-4 text-zinc-400">
                No saved tournaments found
              </div>
            ) : (
              <div className="space-y-2">
                {brackets?.map((bracket) => (
                  <button
                    key={bracket.id}
                    onClick={() => handleLoadBracket(bracket.id)}
                    className="w-full p-3 text-left rounded-lg border border-zinc-700/50 
                      hover:bg-zinc-700/50 transition-colors group"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-zinc-100">{bracket.name}</h3>
                        <p className="text-sm text-zinc-400">
                          Last updated: {new Date(bracket.updated_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        Load
                      </Button>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );

  // Add this before the main return statement
  if (!userId) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-zinc-900 via-zinc-900 to-black text-zinc-300 p-4">
        <div className="max-w-[1920px] mx-auto">
          <Card className="bg-zinc-800/50 border-zinc-700/50 backdrop-blur-sm">
            <div className="p-8 text-center space-y-4">
              <h2 className="text-2xl font-bold text-zinc-100">Welcome to Team Picker</h2>
              <p className="text-zinc-300">Please login to create and manage teams</p>
              <CustomButton
                onClick={() => {
                  // You can add your login handler here or use Clerk's built-in UI
                  window.location.href = '/sign-in';
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2"
              >
                Login to Continue
              </CustomButton>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <StyleTag />
      <div className="min-h-screen bg-gradient-to-b from-zinc-900 via-zinc-900 to-black text-zinc-300 p-4">
        <div className="max-w-[1920px] mx-auto space-y-4">
          {/* Header Section */}
          <div className="w-full">
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-500 mb-6">
              Team Picker
            </h1>

            {/* Add SaveLoadSection below the title */}
            <div className="mb-6 flex justify-end">
              <SaveLoadSection
                players={players}
                teams={teams}
                numTeams={numTeams}
                teamSize={teamSize}
                showRanks={showRanks}
                showTeamLogos={showTeamLogos}
                currentTheme={currentTheme}
                currentMode={currentMode}
                onLoadBracket={handleLoadBracket}
                activeBracketId={selectedBracketId}
                onBracketSelect={setSelectedBracketId}
              />
            </div>

            {/* Mode selector */}
            {modeSelector}

            {/* Add the brackets section here */}
            <BracketsSection
              mode={currentMode}
              teams={teams}
              numTeams={numTeams}
              teamSize={teamSize}
              showTeamLogos={showTeamLogos}
              onTeamsReorder={handleTeamsReorder}
            />

            <StatsSection
              totalPlayers={totalPlayers}
              requiredPlayers={requiredPlayers}
              totalPlayersInTeams={totalPlayersInTeams}
              numTeams={numTeams}
              teamSize={teamSize}
              teams={teams}
              players={players}
            />

            <SettingsSection
              newName={newName}
              setNewName={setNewName}
              isAddingCaptain={isAddingCaptain}
              setIsAddingCaptain={setIsAddingCaptain}
              teamSize={teamSize}
              handleTeamSizeChange={handleTeamSizeChange}
              numTeams={numTeams}
              handleUpdateNumTeams={handleUpdateNumTeams}
              handleAddPlayer={handleAddPlayer}
              addPlayerMutationPending={addPlayerMutation.isPending}
              handlePopulateCaptains={handlePopulateCaptains}
              handlePopulatePlayers={handlePopulatePlayers}
              handlePopulate={handlePopulate}
              autoAssignCaptains={autoAssignCaptains}
              autoAssignPlayers={autoAssignPlayers}
              isCaptainsFull={isCaptainsFull()}
              isPlayersFull={isPlayersFull()}
              isAllPlayersFull={isAllPlayersFull()}
              hasCaptains={players.some(p => p.isCaptain)}
              hasPlayers={players.some(p => !p.isCaptain)}
              currentTheme={currentTheme}
              setCurrentTheme={setCurrentTheme}
              teams={teams}
              getTeamNumber={getTeamNumber}
              showTeamLogos={showTeamLogos}
              setShowTeamLogos={setShowTeamLogos}
              isLogoSectionCollapsed={isLogoSectionCollapsed}
              setIsLogoSectionCollapsed={setIsLogoSectionCollapsed}
              handleClearAll={handleClearAll}
              showRanks={showRanks}
              setShowRanks={setShowRanks}
              userId={userId}
            />
          </div>

          {/* Main 4-Column Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 w-full">
            {/* Captains List */}
            <div className="w-full lg:sticky lg:top-6">
              <Card className="bg-zinc-800/50 border-zinc-700 overflow-hidden">
                <div className="p-4 border-b border-zinc-700">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-xl font-semibold text-white">Available Captains</h2>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 text-sm rounded-md bg-zinc-700/50 text-zinc-300">
                        {playerCounts.captains.total} / {numTeams}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-zinc-400">Sort by:</span>
                    <button
                      onClick={() => {
                        if (captainSort === 'rank') {
                          setCaptainSortDirection(prev => prev === 'desc' ? 'asc' : 'desc');
                        } else {
                          setCaptainSort('rank');
                          setCaptainSortDirection('desc');
                        }
                      }}
                      className={`flex items-center gap-1 px-2 py-1 rounded ${
                        captainSort === 'rank'
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'hover:bg-zinc-700/50 text-zinc-400'
                      }`}
                    >
                      <span>Rank</span>
                      {captainSort === 'rank' && (
                        captainSortDirection === 'desc' 
                          ? <ArrowDown className="h-3 w-3" /> 
                          : <ArrowUp className="h-3 w-3" />
                      )}
                    </button>
                    <button
                      onClick={() => {
                        if (captainSort === 'alphabetical') {
                          setCaptainSortDirection(prev => prev === 'desc' ? 'asc' : 'desc');
                        } else {
                          setCaptainSort('alphabetical');
                          setCaptainSortDirection('desc');
                        }
                      }}
                      className={`flex items-center gap-1 px-2 py-1 rounded ${
                        captainSort === 'alphabetical'
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'hover:bg-zinc-700/50 text-zinc-400'
                      }`}
                    >
                      <span>A-Z</span>
                      {captainSort === 'alphabetical' && (
                        captainSortDirection === 'desc' 
                          ? <ArrowDown className="h-3 w-3" /> 
                          : <ArrowUp className="h-3 w-3" />
                      )}
                    </button>
                  </div>
                </div>
                <Droppable droppableId="captains">
                  {(provided: DroppableProvided, snapshot: DroppableStateSnapshot) => (
                    <div 
                      {...provided.droppableProps} 
                      ref={provided.innerRef} 
                      className={`p-4 ${snapshot.isDraggingOver ? 'min-h-[50px]' : ''}`}
                    >
                      {isLoadingPlayers ? (
                        <div className="text-center py-4">Loading...</div>
                      ) : players.filter(p => p.isCaptain).length === 0 ? (
                        <div className="text-center py-4 text-zinc-400">
                          No captains available
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {(() => {
                            const sortedCaptains = getSortedPlayers(
                              players.filter(p => p.isCaptain),
                              captainSort,
                              captainSortDirection
                            );
                            return sortedCaptains.map((player, index) => (
                              <Draggable
                                key={player.id}
                                draggableId={player.id}
                                index={index}
                                isDragDisabled={areAllTeamsFull(teams, teamSize)}
                              >
                                {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    style={{
                                      ...provided.draggableProps.style,
                                      position: snapshot.isDragging ? 'fixed' : 'relative',
                                      zIndex: snapshot.isDragging ? 100000 : 1,
                                      transform: snapshot.isDragging 
                                        ? `${provided.draggableProps.style?.transform}`
                                        : 'translate(0, 0)',
                                      transformStyle: 'preserve-3d',  // Add this
                                      backfaceVisibility: 'hidden',   // Add this
                                    }}
                                    className={`transform-gpu ${snapshot.isDragging ? 'dragging' : ''}`}
                                  >
                                    <PlayerCard
                                      player={player}
                                      index={index}
                                      isDragging={snapshot.isDragging}
                                      style={{}}
                                      isCaptain={true}
                                      onRemove={handleRemovePlayer}
                                      onRankChange={handleRankChange}
                                      showRanks={showRanks}
                                    />
                                  </div>
                                )}
                              </Draggable>
                            ));
                          })()}
                        </div>
                      )}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </Card>
            </div>

            {/* Teams Container */}
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* First Teams Column */}
              <div className="w-full">
                <div className="space-y-4">
                  {teams.slice(0, Math.ceil(numTeams/2)).map((team, index) => (
                    <Card key={team.id} className="bg-zinc-800/50 border-zinc-700/50 backdrop-blur-sm">
                      <div className="p-2 border-b border-zinc-700/50 relative overflow-hidden"> {/* Reduced padding from p-3 to p-2 */}
                        {/* Logo Background Container */}
                        {showTeamLogos && (
                          <div className="absolute inset-0 w-full h-full">
                            <img 
                              src={`https://picsum.photos/400/400?random=${team.id}`}
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
                        
                        {/* Rest of the team header content */}
                        <div className="flex items-center gap-1 relative z-10"> {/* Reduced gap from gap-2 to gap-1 */}
                          {editingTeamNumber?.id === team.id ? (
                            <input
                              type="number"
                              value={editingTeamNumber.number}
                              onChange={(e) => {
                                const value = parseInt(e.target.value);
                                // Only allow numbers between 1 and numTeams
                                if (!isNaN(value) && value >= 1 && value <= numTeams) {
                                  setEditingTeamNumber({ id: team.id, number: value });
                                }
                              }}
                              onBlur={() => {
                                if (editingTeamNumber) {
                                  handleTeamNumberChange(team.id, editingTeamNumber.number);
                                }
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleTeamNumberChange(team.id, editingTeamNumber.number);
                                } else if (e.key === 'Escape') {
                                  setEditingTeamNumber(null);
                                }
                              }}
                              min={1}
                              max={numTeams}
                              className="w-12 bg-zinc-700/50 border border-zinc-600/50 rounded px-1 py-0.5 text-center text-lg font-semibold text-zinc-100"
                              autoFocus
                            />
                          ) : (
                            <Tooltip.Provider delayDuration={200}>
                              <Tooltip.Root>
                                <Tooltip.Trigger asChild>
                                  <button
                                    onClick={() => setEditingTeamNumber({ 
                                      id: team.id, 
                                      number: parseInt(getTeamNumber(teams.indexOf(team), teams.length)) 
                                    })}
                                    className="w-12 text-center text-lg font-semibold text-zinc-400 hover:text-zinc-200 transition-colors cursor-help"
                                  >
                                    {getTeamNumber(teams.indexOf(team), teams.length)}
                                  </button>
                                </Tooltip.Trigger>
                                <Tooltip.Portal>
                                  <Tooltip.Content
                                    className="px-3 py-1.5 text-sm bg-zinc-800 text-zinc-100 rounded-md shadow-lg border border-zinc-700/50"
                                    sideOffset={5}
                                  >
                                    Click to edit team number
                                    <Tooltip.Arrow className="fill-zinc-800" />
                                  </Tooltip.Content>
                                </Tooltip.Portal>
                              </Tooltip.Root>
                            </Tooltip.Provider>
                          )}
                          <div className="flex items-center justify-between flex-1 min-w-0"> {/* Added min-w-0 to prevent text overflow */}
                            {editingTeamId === team.id ? (
                              <Input
                                value={editingTeamName}
                                onChange={handleTeamNameChange}
                                onBlur={handleTeamNameSave}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    handleTeamNameSave();
                                  } else if (e.key === 'Escape') {
                                    setEditingTeamId(null);
                                    setEditingTeamName('');
                                  }
                                }}
                                className="bg-zinc-700/50 border-zinc-600/50 text-zinc-100"
                                autoFocus
                              />
                            ) : (
                              <Tooltip.Provider delayDuration={200}>
                                <Tooltip.Root>
                                  <Tooltip.Trigger asChild>
                                    <h3 
                                      className={`${getTeamHeaderStyle(team.players.length === teamSize)} truncate max-w-[300px] flex-1 cursor-help`} // Increased from 200px to 300px and added flex-1
                                      onDoubleClick={() => handleTeamNameDoubleClick(team)}
                                    >
                                      <span className="truncate inline-block min-w-0 flex-1">{team.name}</span>
                                      <span className="text-xs text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity ml-2 whitespace-nowrap">
                                        Double click to edit
                                      </span>
                                    </h3>
                                  </Tooltip.Trigger>
                                  <Tooltip.Portal>
                                    <Tooltip.Content
                                      className="px-3 py-1.5 text-sm bg-zinc-800 text-zinc-100 rounded-md shadow-lg border border-zinc-700/50"
                                      sideOffset={5}
                                    >
                                      {team.name}
                                      <Tooltip.Arrow className="fill-zinc-800" />
                                    </Tooltip.Content>
                                  </Tooltip.Portal>
                                </Tooltip.Root>
                              </Tooltip.Provider>
                            )}
                            <div className="flex items-center gap-2 ml-2 shrink-0"> {/* Added ml-2 and shrink-0 */}
                              <Tooltip.Provider delayDuration={200}>
                                <Tooltip.Root>
                                  <Tooltip.Trigger asChild>
                                    <span className={`text-sm px-2 py-0.5 rounded-full transition-colors duration-200 cursor-help ${
                                      calculateTeamStatus(team).isComplete
                                        ? 'bg-green-500/20 text-green-300'
                                        : calculateTeamStatus(team).current === 0
                                          ? 'bg-red-500/20 text-red-300'
                                          : calculateTeamStatus(team).current < calculateTeamStatus(team).required
                                            ? 'bg-yellow-500/20 text-yellow-300'
                                            : 'bg-zinc-700/50 text-zinc-400'
                                    }`}>
                                      {calculateTeamStatus(team).current}/{calculateTeamStatus(team).required}
                                    </span>
                                  </Tooltip.Trigger>
                                  <Tooltip.Portal>
                                    <Tooltip.Content
                                      className="px-3 py-1.5 text-sm bg-zinc-800 text-zinc-100 rounded-md shadow-lg border border-zinc-700/50"
                                      sideOffset={5}
                                    >
                                      {calculateTeamStatus(team).isComplete 
                                        ? 'Team is complete'
                                        : calculateTeamStatus(team).current === 0
                                          ? 'Team is empty'
                                          : `${calculateTeamStatus(team).required - calculateTeamStatus(team).current} spots remaining`}
                                      <Tooltip.Arrow className="fill-zinc-800" />
                                    </Tooltip.Content>
                                  </Tooltip.Portal>
                                </Tooltip.Root>
                              </Tooltip.Provider>
                            </div>
                          </div>
                        </div>
                      </div>
                      <Droppable droppableId={`team-${team.id}`}>
                        {(provided: DroppableProvided, snapshot: DroppableStateSnapshot) => (
                          <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            className={`p-3 ${snapshot.isDraggingOver ? 'bg-blue-500/10' : ''}`}
                          >
                            {team.players.length === 0 ? (
                              <div className="border-2 border-dashed border-zinc-700/50 rounded-md transition-colors group-hover:border-zinc-600/50">
                                <div className="flex items-center justify-center py-8">
                                  <div className="flex flex-col items-center gap-2">
                                    <span className="text-zinc-400 text-sm">Drop players here</span>
                                    <span className="text-zinc-500 text-xs">Team is empty</span>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                {team.players.map((player, playerIndex) => (
                                  <Draggable
                                    key={player.id}
                                    draggableId={`team-${team.id}-player-${player.id}`}
                                    index={playerIndex}
                                    isDragDisabled={player.isCaptain}
                                  >
                                    {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
                                      <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        style={{
                                          ...provided.draggableProps.style,
                                          position: snapshot.isDragging ? 'fixed' : 'relative',
                                          zIndex: snapshot.isDragging ? 100000 : 1,
                                          transform: snapshot.isDragging 
                                            ? `${provided.draggableProps.style?.transform} translateZ(9999px)` 
                                            : provided.draggableProps.style?.transform,
                                        }}
                                        className={`transform-gpu ${snapshot.isDragging ? 'dragging' : ''}`}
                                      >
                                        <TeamPlayerCard
                                          player={player}
                                          index={playerIndex}
                                          team={team}
                                          isDragging={snapshot.isDragging}
                                          style={{}}
                                          onRemove={(player, teamId) => handleRemovePlayerFromTeam(player, teamId)}
                                          onMoveUp={() => handleReorderPlayer(team.id, playerIndex, 'up')}
                                          onMoveDown={() => handleReorderPlayer(team.id, playerIndex, 'down')}
                                          onRankChange={handleRankChange}
                                          showRanks={showRanks}
                                        />
                                      </div>
                                    )}
                                  </Draggable>
                                ))}
                              </div>
                            )}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Second Teams Column */}
              <div className="w-full">
                <div className="space-y-4">
                  {showSingleTeamWarning(numTeams) ? (
                    <Card className="bg-zinc-800/50 border-zinc-700/50 backdrop-blur-sm p-8">
                      <div className="flex flex-col items-center justify-center text-center space-y-3">
                        <Users className="h-12 w-12 text-zinc-400" />
                        <h3 className="text-lg font-medium text-zinc-300">More Teams Needed</h3>
                        <p className="text-sm text-zinc-400"> {/* Removed max-w-sm */}
                          You need at least 2 teams to start the game. Use the "Number of Teams" control above to add more teams.
                        </p>
                      </div>
                    </Card>
                  ) : (
                    teams.slice(Math.ceil(numTeams/2), numTeams).map((team, index) => (
                      <Card key={team.id} className="bg-zinc-800/50 border-zinc-700/50 backdrop-blur-sm">
                        <div className="p-2 border-b border-zinc-700/50 relative overflow-hidden"> {/* Reduced padding from p-3 to p-2 */}
                          {/* Logo Background Container */}
                          {showTeamLogos && (
                            <div className="absolute inset-0 w-full h-full">
                              <img 
                                src={`https://picsum.photos/400/400?random=${team.id}`}
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
                          
                          {/* Rest of the team header content */}
                          <div className="flex items-center gap-1 relative z-10"> {/* Reduced gap from gap-2 to gap-1 */}
                            {editingTeamNumber?.id === team.id ? (
                              <input
                                type="number"
                                value={editingTeamNumber.number}
                                onChange={(e) => {
                                  const value = parseInt(e.target.value);
                                  // Only allow numbers between 1 and numTeams
                                  if (!isNaN(value) && value >= 1 && value <= numTeams) {
                                    setEditingTeamNumber({ id: team.id, number: value });
                                  }
                                }}
                                onBlur={() => {
                                  if (editingTeamNumber) {
                                    handleTeamNumberChange(team.id, editingTeamNumber.number);
                                  }
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    handleTeamNumberChange(team.id, editingTeamNumber.number);
                                  } else if (e.key === 'Escape') {
                                    setEditingTeamNumber(null);
                                  }
                                }}
                                min={1}
                                max={numTeams}
                                className="w-12 bg-zinc-700/50 border border-zinc-600/50 rounded px-1 py-0.5 text-center text-lg font-semibold text-zinc-100"
                                autoFocus
                              />
                            ) : (
                              <Tooltip.Provider delayDuration={200}>
                                <Tooltip.Root>
                                  <Tooltip.Trigger asChild>
                                    <button
                                      onClick={() => setEditingTeamNumber({ 
                                        id: team.id, 
                                        number: parseInt(getTeamNumber(teams.indexOf(team), teams.length)) 
                                      })}
                                      className="w-12 text-center text-lg font-semibold text-zinc-400 hover:text-zinc-200 transition-colors cursor-help"
                                    >
                                      {getTeamNumber(teams.indexOf(team), teams.length)}
                                    </button>
                                  </Tooltip.Trigger>
                                  <Tooltip.Portal>
                                    <Tooltip.Content
                                      className="px-3 py-1.5 text-sm bg-zinc-800 text-zinc-100 rounded-md shadow-lg border border-zinc-700/50"
                                      sideOffset={5}
                                    >
                                      Click to edit team number
                                      <Tooltip.Arrow className="fill-zinc-800" />
                                    </Tooltip.Content>
                                  </Tooltip.Portal>
                                </Tooltip.Root>
                              </Tooltip.Provider>
                            )}
                            <div className="flex items-center justify-between flex-1 min-w-0"> {/* Added min-w-0 to prevent text overflow */}
                              {editingTeamId === team.id ? (
                                <Input
                                  value={editingTeamName}
                                  onChange={handleTeamNameChange}
                                  onBlur={handleTeamNameSave}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      handleTeamNameSave();
                                    } else if (e.key === 'Escape') {
                                      setEditingTeamId(null);
                                      setEditingTeamName('');
                                    }
                                  }}
                                  className="bg-zinc-700/50 border-zinc-600/50 text-zinc-100"
                                  autoFocus
                                />
                              ) : (
                                <Tooltip.Provider delayDuration={200}>
                                  <Tooltip.Root>
                                    <Tooltip.Trigger asChild>
                                      <h3 
                                        className={`${getTeamHeaderStyle(team.players.length === teamSize)} truncate max-w-[300px] flex-1 cursor-help`} // Increased from 200px to 300px and added flex-1
                                        onDoubleClick={() => handleTeamNameDoubleClick(team)}
                                      >
                                        <span className="truncate inline-block min-w-0 flex-1">{team.name}</span>
                                        <span className="text-xs text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity ml-2 whitespace-nowrap">
                                          Double click to edit
                                        </span>
                                      </h3>
                                    </Tooltip.Trigger>
                                    <Tooltip.Portal>
                                      <Tooltip.Content
                                        className="px-3 py-1.5 text-sm bg-zinc-800 text-zinc-100 rounded-md shadow-lg border border-zinc-700/50"
                                        sideOffset={5}
                                      >
                                        {team.name}
                                        <Tooltip.Arrow className="fill-zinc-800" />
                                      </Tooltip.Content>
                                    </Tooltip.Portal>
                                  </Tooltip.Root>
                                </Tooltip.Provider>
                              )}
                              <div className="flex items-center gap-2 ml-2 shrink-0"> {/* Added ml-2 and shrink-0 */}
                                <Tooltip.Provider delayDuration={200}>
                                  <Tooltip.Root>
                                    <Tooltip.Trigger asChild>
                                      <span className={`text-sm px-2 py-0.5 rounded-full transition-colors duration-200 cursor-help ${
                                        calculateTeamStatus(team).isComplete
                                          ? 'bg-green-500/20 text-green-300'
                                          : calculateTeamStatus(team).current === 0
                                            ? 'bg-red-500/20 text-red-300'
                                            : calculateTeamStatus(team).current < calculateTeamStatus(team).required
                                              ? 'bg-yellow-500/20 text-yellow-300'
                                              : 'bg-zinc-700/50 text-zinc-400'
                                      }`}>
                                        {calculateTeamStatus(team).current}/{calculateTeamStatus(team).required}
                                      </span>
                                    </Tooltip.Trigger>
                                    <Tooltip.Portal>
                                      <Tooltip.Content
                                        className="px-3 py-1.5 text-sm bg-zinc-800 text-zinc-100 rounded-md shadow-lg border border-zinc-700/50"
                                        sideOffset={5}
                                      >
                                        {calculateTeamStatus(team).isComplete 
                                          ? 'Team is complete'
                                          : calculateTeamStatus(team).current === 0
                                            ? 'Team is empty'
                                            : `${calculateTeamStatus(team).required - calculateTeamStatus(team).current} spots remaining`}
                                        <Tooltip.Arrow className="fill-zinc-800" />
                                      </Tooltip.Content>
                                    </Tooltip.Portal>
                                  </Tooltip.Root>
                                </Tooltip.Provider>
                              </div>
                            </div>
                          </div>
                        </div>
                        <Droppable droppableId={`team-${team.id}`}>
                          {(provided: DroppableProvided, snapshot: DroppableStateSnapshot) => (
                            <div
                              {...provided.droppableProps}
                              ref={provided.innerRef}
                              className={`p-3 ${snapshot.isDraggingOver ? 'bg-blue-500/10' : ''}`}
                            >
                              {team.players.length === 0 ? (
                                <div className="border-2 border-dashed border-zinc-700/50 rounded-md transition-colors group-hover:border-zinc-600/50">
                                  <div className="flex items-center justify-center py-8">
                                    <div className="flex flex-col items-center gap-2">
                                      <span className="text-zinc-400 text-sm">Drop players here</span>
                                      <span className="text-zinc-500 text-xs">Team is empty</span>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  {team.players.map((player, playerIndex) => (
                                    <Draggable
                                      key={player.id}
                                      draggableId={`team-${team.id}-player-${player.id}`}
                                      index={playerIndex}
                                      isDragDisabled={player.isCaptain}
                                    >
                                      {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
                                        <div
                                          ref={provided.innerRef}
                                          {...provided.draggableProps}
                                          {...provided.dragHandleProps}
                                          style={{
                                            ...provided.draggableProps.style,
                                            position: snapshot.isDragging ? 'fixed' : 'relative',
                                            zIndex: snapshot.isDragging ? 100000 : 1,
                                            transform: snapshot.isDragging 
                                              ? `${provided.draggableProps.style?.transform} translateZ(9999px)` 
                                              : provided.draggableProps.style?.transform,
                                          }}
                                          className={`transform-gpu ${snapshot.isDragging ? 'dragging' : ''}`}
                                        >
                                          <TeamPlayerCard
                                            player={player}
                                            index={playerIndex}
                                            team={team}
                                            isDragging={snapshot.isDragging}
                                            style={{}}
                                            onRemove={(player, teamId) => handleRemovePlayerFromTeam(player, teamId)}
                                            onMoveUp={() => handleReorderPlayer(team.id, playerIndex, 'up')}
                                            onMoveDown={() => handleReorderPlayer(team.id, playerIndex, 'down')}
                                            onRankChange={handleRankChange}
                                            showRanks={showRanks}
                                          />
                                        </div>
                                      )}
                                    </Draggable>
                                  ))}
                                </div>
                              )}
                              {provided.placeholder}
                            </div>
                          )}
                        </Droppable>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Players List */}
            <div className="w-full lg:sticky lg:top-6">
              <Card className="bg-zinc-800/50 border-zinc-700 overflow-hidden">
                <div className="p-4 border-b border-zinc-700">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-xl font-semibold text-white">Available Players</h2>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 text-sm rounded-md bg-zinc-700/50 text-zinc-300">
                        {players.filter(p => !p.isCaptain).length} / {calculateAvailablePlayerSlots(teams, numTeams, teamSize)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-zinc-400">Sort by:</span>
                    <button
                      onClick={() => {
                        if (playerSort === 'rank') {
                          setPlayerSortDirection(prev => prev === 'desc' ? 'asc' : 'desc');
                        } else {
                          setPlayerSort('rank');
                          setPlayerSortDirection('desc');
                        }
                      }}
                      className={`flex items-center gap-1 px-2 py-1 rounded ${
                        playerSort === 'rank'
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'hover:bg-zinc-700/50 text-zinc-400'
                      }`}
                    >
                      <span>Rank</span>
                      {playerSort === 'rank' && (
                        playerSortDirection === 'desc' 
                          ? <ArrowDown className="h-3 w-3" /> 
                          : <ArrowUp className="h-3 w-3" />
                      )}
                    </button>
                    <button
                      onClick={() => {
                        if (playerSort === 'alphabetical') {
                          setPlayerSortDirection(prev => prev === 'desc' ? 'asc' : 'desc');
                        } else {
                          setPlayerSort('alphabetical');
                          setPlayerSortDirection('desc');
                        }
                      }}
                      className={`flex items-center gap-1 px-2 py-1 rounded ${
                        playerSort === 'alphabetical'
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'hover:bg-zinc-700/50 text-zinc-400'
                      }`}
                    >
                      <span>A-Z</span>
                      {playerSort === 'alphabetical' && (
                        playerSortDirection === 'desc' 
                          ? <ArrowDown className="h-3 w-3" /> 
                          : <ArrowUp className="h-3 w-3" />
                      )}
                    </button>
                  </div>
                </div>
                <Droppable droppableId="players">
                  {(provided: DroppableProvided, snapshot: DroppableStateSnapshot) => (
                    <div 
                      {...provided.droppableProps} 
                      ref={provided.innerRef} 
                      className={`p-4 ${snapshot.isDraggingOver ? 'min-h-[50px]' : ''}`}
                    >
                      {isLoadingPlayers ? (
                        <div className="text-center py-4">Loading...</div>
                      ) : players.filter(p => !p.isCaptain).length === 0 ? (
                        <div className="text-center py-4 text-zinc-400">
                          No players available
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {(() => {
                            const sortedPlayers = getSortedPlayers(
                              players.filter(p => !p.isCaptain),
                              playerSort,
                              playerSortDirection
                            );
                            return sortedPlayers.map((player, index) => (
                              <Draggable
                                key={player.id}
                                draggableId={player.id}
                                index={index}
                                isDragDisabled={areAllTeamsFull(teams, teamSize)}
                              >
                                {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    style={{
                                      ...provided.draggableProps.style,
                                      position: snapshot.isDragging ? 'fixed' : 'relative',
                                      zIndex: snapshot.isDragging ? 100000 : 1,
                                      transform: snapshot.isDragging 
                                        ? `${provided.draggableProps.style?.transform}`
                                        : 'translate(0, 0)',
                                      transformStyle: 'preserve-3d',  // Add this
                                      backfaceVisibility: 'hidden',   // Add this
                                    }}
                                    className={`transform-gpu ${snapshot.isDragging ? 'dragging' : ''}`}
                                  >
                                    <PlayerCard
                                      player={player}
                                      index={index}
                                      isDragging={snapshot.isDragging}
                                      style={{}}
                                      onRemove={handleRemovePlayer}
                                      onRankChange={handleRankChange}
                                      showRanks={showRanks}
                                    />
                                  </div>
                                )}
                              </Draggable>
                            ));
                          })()}
                        </div>
                      )}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </DragDropContext>
  );
};

export default TeamPickerV2;