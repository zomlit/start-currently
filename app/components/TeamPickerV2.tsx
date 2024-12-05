<<<<<<< HEAD
import React, { useState, useEffect, useCallback, useReducer, useRef, useMemo } from 'react';
=======
import React, { useState, useEffect } from 'react';
>>>>>>> f1e350e7f4d0d7b316de72e89caafb7296b7ea63
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
<<<<<<< HEAD
  Save, FolderOpen, Plus, Crown
=======
  Save, FolderOpen, Plus
>>>>>>> f1e350e7f4d0d7b316de72e89caafb7296b7ea63
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
<<<<<<< HEAD
=======
import { toast } from "@/utils/toast";
>>>>>>> f1e350e7f4d0d7b316de72e89caafb7296b7ea63
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SaveLoadSection } from './team-picker/save-load-section';
<<<<<<< HEAD
import { type BracketData } from './team-picker/brackets-section';
import BracketsSectionV2 from './team-picker/brackets-section';
import { toast } from 'sonner';
import { isEqual } from 'lodash';
import debounce from 'lodash/debounce';
import { 
  bracketOperations, 
  teamOperations, 
  playerOperations,
  mutationOperations,
  tournamentOperations,
  dragDropOperations // Add this to the existing import
} from '@/lib/team-picker/operations';
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
=======
>>>>>>> f1e350e7f4d0d7b316de72e89caafb7296b7ea63

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
<<<<<<< HEAD
  player: Player | Captain;
=======
  player: Player;
>>>>>>> f1e350e7f4d0d7b316de72e89caafb7296b7ea63
  index: number;
  team: Captain;
  isDragging: boolean;
  style: React.CSSProperties;
<<<<<<< HEAD
  onRemove?: (player: Player | Captain, teamId: string) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onRankChange?: (id: string, rank: string) => void;
=======
  onRankChange?: (playerId: string, newRank: string) => void;
>>>>>>> f1e350e7f4d0d7b316de72e89caafb7296b7ea63
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
<<<<<<< HEAD
  onRemove?: (player: Player | Captain, teamId: string) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onRankChange?: (id: string, rank: string) => void;
=======
  onRemove?: (player: Player, teamId: string) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onRankChange?: (playerId: string, newRank: string) => void;
>>>>>>> f1e350e7f4d0d7b316de72e89caafb7296b7ea63
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
<<<<<<< HEAD
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onRemove(player, team.id);  // Pass both player and teamId
            }}
=======
            onClick={() => onRemove(player, team.id)}
>>>>>>> f1e350e7f4d0d7b316de72e89caafb7296b7ea63
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
<<<<<<< HEAD
type PickerMode = 'tournament' | '6mans' | 'casual' | 'ranked' | 'custom' | 'standard';
=======
type PickerMode = 'tournament' | '6mans' | 'casual' | 'ranked' | 'custom';
>>>>>>> f1e350e7f4d0d7b316de72e89caafb7296b7ea63

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
<<<<<<< HEAD
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
=======
>>>>>>> f1e350e7f4d0d7b316de72e89caafb7296b7ea63
  }
];

// Add these types near the top of the file
interface SavedBracket {
  id: string;
<<<<<<< HEAD
  data: {
    teams: Captain[];
    players: Player[];
    settings: {
      mode: PickerMode;
=======
  name: string;
  created_at: string;
  updated_at: string;
  data: {
    players: Player[];
    teams: Captain[];
    settings: {
>>>>>>> f1e350e7f4d0d7b316de72e89caafb7296b7ea63
      numTeams: number;
      teamSize: number;
      showRanks: boolean;
      showTeamLogos: boolean;
<<<<<<< HEAD
      currentTheme: ThemePreset;
    };
    bracket_data?: BracketData | null;
  };
  bracket_data: BracketData | null;
}

// Update the team interface to include teamNumber
interface Captain {
  id: string;
  name: string;
  players: Player[];
  teamNumber: string; // Add this field
  status?: 'pending' | 'live' | 'completed'; // Add this field
}

// Update the function that creates teams to include teamNumber
const createTeamWithNumber = (index: number, totalTeams: number) => {
  const teamNumber = index < Math.ceil(totalTeams/2)
    ? i * 2 + 1  // Odd numbers (1,3,5,7)
    : (index - Math.ceil(totalTeams/2)) * 2 + 2;  // Even numbers (2,4,6,8)
  
  return {
    id: `team-${Date.now()}-${index}`,
    name: `Team ${String(teamNumber).padStart(2, '0')}`,
    players: [],
    captains: [],
    teamNumber: String(teamNumber).padStart(2, '0')
  };
};

// Add these helper functions at the top level
const filterCaptains = (players: Player[]) => players.filter(p => p.isCaptain);
const filterPlayers = (players: Player[]) => players.filter(p => !p.isCaptain);

// Update the initial data creation
const createInitialData = (mode: PickerMode = 'tournament') => {
  const modeConfig = PICKER_MODES.find(m => m.id === mode) || PICKER_MODES[0];
  const numTeams = modeConfig.defaultTeams;
  
  // Create empty teams
  const teams = Array.from({ length: numTeams }, (_, i) => ({
    id: `team-${Date.now()}-${i}`,
    name: `Team ${String(i + 1).padStart(2, '0')}`,
    players: [],
    captains: [],
    teamNumber: String(i + 1).padStart(2, '0')
  }));

  return {
    teams,
    players: [],    // Regular players array
    captains: [],   // Add captains array
    settings: {
      mode,
      numTeams,
      teamSize: modeConfig.defaultTeamSize,
      showRanks: modeConfig.features.ranks,
      currentTheme: 'random' as ThemePreset,
      showTeamLogos: modeConfig.features.teamLogos
    }
  };
};

// Update the handleCreateBracket function
const handleCreateBracket = async (name: string) => {
  try {
    const initialData = createInitialData(currentMode);
    const result = await bracketOperations.create({
      name,
      teams: initialData.teams,
      players: [],
      captains: [], // Add this line
      settings: {
        mode: currentMode,
        numTeams: initialData.settings.numTeams,
        teamSize: initialData.settings.teamSize,
        showRanks: initialData.settings.showRanks,
        showTeamLogos: initialData.settings.showTeamLogos,
        currentTheme: initialData.settings.currentTheme
      }
    });

    if (result) {
      setSelectedBracketId(result.id);
      toast.success('Tournament created successfully');
    }
  } catch (error) {
    console.error('Error creating bracket:', error);
    toast.error('Failed to create tournament');
  }
};

=======
      currentTheme: string;
      mode: string;
    };
  };
}

>>>>>>> f1e350e7f4d0d7b316de72e89caafb7296b7ea63
// Update the TeamPickerV2 component to include mode selection
const TeamPickerV2: React.FC<TeamPickerProps> = ({ initialState = null, isSharedView = false }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
<<<<<<< HEAD
  
  // Add these state declarations at the top
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Captain[]>([]);

=======
>>>>>>> f1e350e7f4d0d7b316de72e89caafb7296b7ea63
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

<<<<<<< HEAD
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
          captains: [],
          teamNumber: String(teamNumber).padStart(2, '0')
        };
      });
    },
    enabled: true,
  });

  // Update the players query
  const { data: playersList = [], isLoading: isLoadingPlayers } = useQuery<Player[]>({
=======
  // Query for teams with initial data
  const { data: teams = [], isLoading: isLoadingTeams } = useQuery<Captain[]>({
    queryKey: ['teams'],
    initialData: Array.from({ length: numTeams }, (_, i) => {
      const teamNumber = i < Math.ceil(numTeams/2)
        ? i * 2 + 1  // Odd numbers (1,3,5,7)
        : (i - Math.ceil(numTeams/2)) * 2 + 2;  // Even numbers (2,4,6,8)
      return {
        id: `team-${Date.now()}-${i}`,
        name: `Team ${String(teamNumber).padStart(2, '0')}`,
        players: [],
      };
    }),
    enabled: true,
  });

  // Query for players pool
  const { data: players = [], isLoading: isLoadingPlayers } = useQuery<Player[]>({
>>>>>>> f1e350e7f4d0d7b316de72e89caafb7296b7ea63
    queryKey: ['players'],
    initialData: [],
    enabled: true,
  });

<<<<<<< HEAD
  // Update the state setters to use the query data
  useEffect(() => {
    setPlayers(playersList);
  }, [playersList]);

  useEffect(() => {
    setTeams(teamsList);
  }, [teamsList]);

  // Update the updateTeamsMutation definition
  const updateTeamsMutation = useMutation({
    mutationFn: (teams: Captain[]) => 
      mutationOperations.updateTeams.mutate(teams, activeBracketId!),
    onSuccess: (teams) => 
      mutationOperations.updateTeams.onSuccess(teams, queryClient),
  });

  // Update the brackets query
  const { data: brackets } = useQuery({
    queryKey: ['brackets', userId],
    queryFn: () => userId ? bracketOperations.list(userId) : [],
    enabled: !!userId,
    initialData: [],
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

=======
  // Add this mutation for updating teams
  const updateTeamsMutation = useMutation({
    mutationFn: async (newTeams: Captain[]) => {
      const result = await Promise.resolve(newTeams);
      
      // Save to Supabase
      const { error } = await supabase
        .from('Bracket')
        .update({
          data: {
            players: players,
            teams: newTeams,
          },
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      if (error) {
        console.error('Error updating teams in Supabase:', error);
      }
      
      return result;
    },
    onSuccess: (newTeams) => {
      queryClient.setQueryData(['teams'], newTeams);
    },
  });

  // Add this query to load initial data
  const { data: bracketData } = useQuery({
    queryKey: ['bracket', userId],
    queryFn: async () => {
      if (!userId) return null;
      
      const { data, error } = await supabase
        .from('Bracket')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error loading bracket data:', error);
        return null;
      }

      return data;
    },
    enabled: !!userId,
  });

  // Add this effect to handle initial data loading
  useEffect(() => {
    if (bracketData?.data) {
      const { players: savedPlayers, teams: savedTeams } = bracketData.data;
      
      if (savedPlayers) {
        queryClient.setQueryData(['players'], savedPlayers);
      }
      
      if (savedTeams) {
        queryClient.setQueryData(['teams'], savedTeams);
      }
    }
  }, [bracketData]);

>>>>>>> f1e350e7f4d0d7b316de72e89caafb7296b7ea63
  useEffect(() => {
    console.log('Current players:', players);
  }, [players]);

<<<<<<< HEAD
  // First, add a helper function to get the next team number
  const getNextTeamNumber = (existingTeams: Captain[]) => {
    if (existingTeams.length === 0) return 1;
    
    // Get all team numbers from team names
    const teamNumbers = existingTeams.map(team => {
      const match = team.name.match(/Team (\d+)/);
      return match ? parseInt(match[1]) : 0;
    });

    // Find the next available number
    for (let i = 1; i <= numTeams; i++) {
      if (!teamNumbers.includes(i)) {
        return i;
      }
    }
    return existingTeams.length + 1;
  };

  // Update the addPlayerMutation
  const addPlayerMutation = useMutation({
    mutationFn: async (player: Player) => {
      if (!selectedBracketId) throw new Error('No active bracket selected');

      return mutationOperations.addPlayer.mutate(
        player,
        userId,
        selectedBracketId,
        {
          players,
          teams,
          numTeams,
          teamSize,
          showRanks,
          showTeamLogos,
          currentTheme,
          mode: currentMode
        }
      );
    },
    onSuccess: (result) => {
      // Update local state immediately
      if (result.player.isCaptain) {
        // Add to players list (since we filter by isCaptain flag for display)
        setPlayers(prev => [...prev, result.player]);
      } else {
        // Add to players list
        setPlayers(prev => [...prev, result.player]);
      }

      // Update teams if needed
      if (result.teams) {
        setTeams(result.teams);
      }

      toast.success(`${result.player.isCaptain ? 'Captain' : 'Player'} added successfully`);
    },
    onError: (error) => {
      console.error('Error adding player:', error);
      toast.error(`Failed to add ${isAddingCaptain ? 'captain' : 'player'}`);
    }
=======
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
>>>>>>> f1e350e7f4d0d7b316de72e89caafb7296b7ea63
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
<<<<<<< HEAD
  const handleAddPlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim()) {
      const colors = generatePlayerColors();
      const defaultRank = ROCKET_LEAGUE_RANKS[ROCKET_LEAGUE_RANKS.length - 1];
=======
  const handleAddPlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim()) {
      const colors = generatePlayerColors();
      // Use the first rank from ROCKET_LEAGUE_RANKS
      const defaultRank = ROCKET_LEAGUE_RANKS[ROCKET_LEAGUE_RANKS.length - 1]; // Gets B1 since array is reversed
>>>>>>> f1e350e7f4d0d7b316de72e89caafb7296b7ea63
      
      const newPlayer: Player = {
        id: `player-${Date.now()}`,
        name: newName.trim(),
        backgroundColor: colors.background,
        borderColor: colors.border,
        rank: defaultRank.name,
<<<<<<< HEAD
        abbreviatedRank: defaultRank.name,
=======
        abbreviatedRank: defaultRank.name, // The rank names in rankUtils are already abbreviated
>>>>>>> f1e350e7f4d0d7b316de72e89caafb7296b7ea63
        iconUrl: defaultRank.iconUrl,
        isCaptain: isAddingCaptain,
      };

      addPlayerMutation.mutate(newPlayer);
      setNewName('');
    }
  };

<<<<<<< HEAD
  // First, update the handleRemovePlayer function to use the dialog
  const handleRemovePlayer = (id: string) => {
    // Find the player and their team
    const player = [...players, ...teams.flatMap(t => t.players)].find(p => p.id === id);
    if (!player) return;

    const team = teams.find(t => t.players.some(p => p.id === id));
    if (!team) return;

    console.log(' Remove button clicked:', { player, teamId: team.id });
    
    // Set the dialog state to show the confirmation dialog
    setRemoveDialogState({
      playerId: id,
      teamId: team.id,
      playerName: player.name,
      isCaptain: 'isCaptain' in player
    });
  };

  // Update the handleUpdateNumTeams to use the new function
=======
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
>>>>>>> f1e350e7f4d0d7b316de72e89caafb7296b7ea63
  const handleUpdateNumTeams = (newNum: number) => {
    if (isNaN(newNum)) return;
    
    setNumTeams(newNum);
    
    const currentTeams = [...teams];
    if (newNum > currentTeams.length) {
      // Add new teams with correct numbering
      for (let i = currentTeams.length; i < newNum; i++) {
<<<<<<< HEAD
        currentTeams.push(createTeamWithNumber(i, newNum));
=======
        const teamNumber = i < Math.ceil(newNum/2)
          ? i * 2 + 1  // Odd numbers (1,3,5,7)
          : (i - Math.ceil(newNum/2)) * 2 + 2;  // Even numbers (2,4,6,8)
        currentTeams.push({
          id: `team-${Date.now()}-${i}`,
          name: `Team ${String(teamNumber).padStart(2, '0')}`,
          players: [],
        });
>>>>>>> f1e350e7f4d0d7b316de72e89caafb7296b7ea63
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
    
<<<<<<< HEAD
    // Update team numbers for all teams
    const updatedTeams = currentTeams.map((team, index) => ({
      ...team,
      teamNumber: getTeamNumber(index, newNum)
    }));
    
    updateTeamsMutation.mutate(updatedTeams);
=======
    updateTeamsMutation.mutate(currentTeams);
>>>>>>> f1e350e7f4d0d7b316de72e89caafb7296b7ea63
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

<<<<<<< HEAD
  // First, keep the original handleRemovePlayerFromTeam function for the actual removal logic
  const handleRemovePlayerFromTeam = async ({
    playerId,
    teamId,
    teams,
    players,
    activeBracketId,
    settings
  }: {
    playerId: string;
    teamId: string;
    teams: Captain[];
    players: Player[];
    activeBracketId: string | null;
    settings: {
      numTeams: number;
      teamSize: number;
      showRanks: boolean;
      showTeamLogos: boolean;
      currentTheme: ThemePreset;
      mode: PickerMode;
    };
  }) => {
    const team = teams.find(t => t.id === teamId);
    if (!team) return;

    const playerToRemove = team.players.find(p => p.id === playerId);
    if (!playerToRemove) return;

    const playerIndex = team.players.findIndex(p => p.id === playerId);
    const isCurrentCaptain = playerIndex === 0;

    console.log('Removing player:', { 
      player: playerToRemove, 
      isCurrentCaptain,
      isCaptainProperty: playerToRemove.isCaptain 
    });

    const updatedTeams = teams.map(t => {
      if (t.id === teamId) {
        const remainingPlayers = t.players.filter(p => p.id !== playerId);
=======
  const handleRemovePlayerFromTeam = (player: Player, teamId: string) => {
    const team = teams.find(t => t.id === teamId);
    if (!team) return;

    const playerIndex = team.players.findIndex(p => p.id === player.id);
    const isCurrentCaptain = playerIndex === 0;

    const updatedTeams = teams.map(t => {
      if (t.id === teamId) {
        const remainingPlayers = t.players.filter(p => p.id !== player.id);
>>>>>>> f1e350e7f4d0d7b316de72e89caafb7296b7ea63
        
        if (remainingPlayers.length > 0 && isCurrentCaptain) {
          // Promote next player to captain
          const newCaptain = { ...remainingPlayers[0], isCaptain: true };
          const otherPlayers = remainingPlayers.slice(1);
          
          return {
            ...t,
<<<<<<< HEAD
            name: formatTeamName(newCaptain.name),
=======
            name: formatTeamName(newCaptain.name), // Use formatTeamName here
>>>>>>> f1e350e7f4d0d7b316de72e89caafb7296b7ea63
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

<<<<<<< HEAD
    // Add player back to the appropriate list with correct captain status
    const playerToAdd = {
      ...playerToRemove,
      isCaptain: isCurrentCaptain || playerToRemove.isCaptain // Keep captain status if they were a captain
    };

    // Split players into captains and regular players
    const existingPlayers = players.filter(p => !p.isCaptain);
    const existingCaptains = players.filter(p => p.isCaptain);

    // Add the player to the appropriate list while maintaining sort order
    const updatedPlayers = playerToAdd.isCaptain
      ? [...existingCaptains, playerToAdd, ...existingPlayers]
      : [...existingCaptains, ...existingPlayers, playerToAdd];

    // Update the database if we have an active bracket
    if (activeBracketId) {
      const { error } = await supabase
        .from('Bracket')
        .update({
          data: {
            teams: updatedTeams,
            players: updatedPlayers,
            settings
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', activeBracketId);

      if (error) throw error;
    }

    // Update local state
    queryClient.setQueryData(['teams'], updatedTeams);
    queryClient.setQueryData(['players'], updatedPlayers);
    
    // Force update of team status
    queryClient.invalidateQueries({ queryKey: ['teams'] });

    return { updatedTeams, updatedPlayers };
  };

  // Then update the dialog's Remove button click handler
  <Button 
    variant="destructive" 
    onClick={async () => {
      if (!removeDialogState) return;
      
      try {
        await handleRemovePlayerFromTeam({
          playerId: removeDialogState.playerId,
          teamId: removeDialogState.teamId,
          teams,
          players,
          activeBracketId: selectedBracketId,
          settings: {
            numTeams,
            teamSize,
            showRanks,
            showTeamLogos,
            currentTheme,
            mode: currentMode
          }
        });
        toast.success('Player removed successfully');
      } catch (error) {
        console.error('Failed to remove player:', error);
        toast.error('Failed to remove player from team');
      } finally {
        setRemoveDialogState(null);
      }
    }}
  >
    Remove
  </Button>

=======
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

>>>>>>> f1e350e7f4d0d7b316de72e89caafb7296b7ea63
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

<<<<<<< HEAD
  // Update the handleDragEnd function
  const handleDragEnd = async (result: DropResult) => {
    const { source, destination } = result;
    
    if (!destination) return;

    // Add a check for selectedBracketId
    if (!selectedBracketId) {
      toast.error('Please select or create a bracket first');
      return;
    }

    // Check if we're trying to drop a player above a captain
    if (destination.droppableId.startsWith('team-')) {
      const teamId = destination.droppableId.replace('team-', '');
      const team = teams.find(t => t.id === teamId);
      
      if (team && team.players.length > 0) {
        // Check if there's a captain at index 0
        const hasCaptainAtZero = team.players[0]?.isCaptain;
        
        // If trying to drop at index 0 and there's already a captain there
        if (destination.index === 0 && hasCaptainAtZero) {
          toast.error("Cannot place a player above the team captain");
          return;
        }

        // Get the dragged player
        const draggedPlayerId = result.draggableId.replace(`team-${teamId}-player-`, '');
        const draggedPlayer = [...players, ...teams.flatMap(t => t.players)]
          .find(p => p.id === draggedPlayerId);

        // If trying to place a non-captain between index 0 and a captain
        if (!draggedPlayer?.isCaptain) {
          const captainIndex = team.players.findIndex(p => p.isCaptain);
          if (captainIndex !== -1 && destination.index <= captainIndex) {
            toast.error("Cannot place a player above the team captain");
            return;
          }
        }
      }
    }

    console.log('Drag operation started:', {
      source,
      destination,
      currentTeams: teams,
      currentPlayers: players,
      activeBracketId: selectedBracketId
    });

    try {
      const result = await dragDropOperations.handleDragDrop({
        source,
        destination,
        teams,
        players,
        teamSize,
        activeBracketId: selectedBracketId,
        settings: {
          numTeams,
          teamSize,
          showRanks,
          showTeamLogos,
          currentTheme,
          mode: currentMode
        }
      });

      if (result) {
        // Ensure captains stay at index 0
        const newTeams = result.newTeams.map(team => {
          if (team.players.length > 0) {
            // Find the captain if there is one
            const captainIndex = team.players.findIndex(p => p.isCaptain);
            if (captainIndex > 0) {
              // If captain isn't at index 0, move them there
              const captain = team.players[captainIndex];
              const otherPlayers = team.players.filter((_, i) => i !== captainIndex);
              return {
                ...team,
                players: [captain, ...otherPlayers]
              };
            }
          }
          return team;
        });

        setTeams(newTeams);
        setPlayers(result.newPlayers);
      }
    } catch (error) {
      console.error('Failed to handle drag and drop:', error);
      toast.error('Failed to save changes');
    }
=======
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
>>>>>>> f1e350e7f4d0d7b316de72e89caafb7296b7ea63
  };

  const handleTeamSizeChange = (newSize: number) => {
    const size = Math.min(Math.max(1, newSize), 4); // Clamp between 1 and 4
    setTeamSize(size);
  };

<<<<<<< HEAD
=======
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

>>>>>>> f1e350e7f4d0d7b316de72e89caafb7296b7ea63
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
<<<<<<< HEAD
    mutationFn: (updates: { playerId: string; newRank: string }) => 
      mutationOperations.updatePlayerRank.mutate({ 
        ...updates, 
        RANK_IMAGES 
      }),
    onSuccess: (updates) => 
      mutationOperations.updatePlayerRank.onSuccess(
        { ...updates, RANK_IMAGES }, 
        queryClient
      ),
=======
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
>>>>>>> f1e350e7f4d0d7b316de72e89caafb7296b7ea63
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

<<<<<<< HEAD
  // Update the handleTeamNumberChange to save the new number
  const handleTeamNumberChange = (teamId: string, newNumber: number) => {
    const updatedTeams = teams.map(team => {
      if (team.id === teamId) {
        return {
          ...team,
          teamNumber: String(newNumber).padStart(2, '0')
        };
      }
      return team;
    });

=======
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
>>>>>>> f1e350e7f4d0d7b316de72e89caafb7296b7ea63
    updateTeamsMutation.mutate(updatedTeams);
    setEditingTeamNumber(null);
  };

  // Add these helper functions near the top of the component
<<<<<<< HEAD
  const calculateTotalPlayersInTeams = useCallback((teams: Captain[]) => {
    return teams.reduce((total, team) => total + team.players.length, 0);
  }, []);

  const calculateRequiredPlayers = useCallback((numTeams: number, teamSize: number) => {
    return numTeams * teamSize;
  }, []);
=======
  const calculateTotalPlayersInTeams = (teams: Captain[]) => {
    return teams.reduce((total, team) => total + team.players.length, 0);
  };

  const calculateRequiredPlayers = (numTeams: number, teamSize: number) => {
    return numTeams * teamSize;
  };
>>>>>>> f1e350e7f4d0d7b316de72e89caafb7296b7ea63

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
<<<<<<< HEAD
  const calculatePlayerCounts = useCallback(() => {
=======
  const calculatePlayerCounts = () => {
>>>>>>> f1e350e7f4d0d7b316de72e89caafb7296b7ea63
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

<<<<<<< HEAD
=======
    // Total players
    const totalPlayers = totalCaptains + totalRegularPlayers;

>>>>>>> f1e350e7f4d0d7b316de72e89caafb7296b7ea63
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
<<<<<<< HEAD
      total: totalCaptains + totalRegularPlayers
    };
  }, [players, teams]);

  // Update the stats calculations
  const playerCounts = calculatePlayerCounts();
  const totalPlayersInTeams = calculateTotalPlayersInTeams(teams);
=======
      total: totalPlayers
    };
  };

  // Update the stats calculations
  const playerCounts = calculatePlayerCounts();
  const totalPlayersInTeams = teams.reduce((sum, team) => sum + team.players.length, 0);
>>>>>>> f1e350e7f4d0d7b316de72e89caafb7296b7ea63
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

<<<<<<< HEAD
  // Update the autoAssignCaptains function
=======
  // Add these helper functions for auto-assignment
>>>>>>> f1e350e7f4d0d7b316de72e89caafb7296b7ea63
  const autoAssignCaptains = () => {
    // Get available captains from pool
    const availableCaptains = [...players].filter(p => p.isCaptain);
    
<<<<<<< HEAD
    if (availableCaptains.length === 0) return;
=======
    if (availableCaptains.length === 0) {
      return;
    }
>>>>>>> f1e350e7f4d0d7b316de72e89caafb7296b7ea63

    // Sort captains by rank (highest to lowest)
    const sortedCaptains = [...availableCaptains].sort((a, b) => {
      const rankA = RANK_ORDER.indexOf(a.abbreviatedRank || 'B1');
      const rankB = RANK_ORDER.indexOf(b.abbreviatedRank || 'B1');
      return rankB - rankA; // Higher ranks first
    });

    // Find empty teams
    const emptyTeams = teams.filter(team => team.players.length === 0);
<<<<<<< HEAD
    if (emptyTeams.length === 0) return;

    // Create new teams array
    const updatedTeams = teams.map(team => {
      // If this is an empty team and we have captains to assign
      if (team.players.length === 0 && sortedCaptains.length > 0) {
        const captain = sortedCaptains.shift()!;
        return {
          ...team,
          name: formatTeamName(captain.name),
          players: [{ ...captain, isCaptain: true }],
          teamNumber: team.teamNumber // Preserve team number
        };
      }
      return team;
    });

    // Update teams locally
=======
    
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

    // Update teams
>>>>>>> f1e350e7f4d0d7b316de72e89caafb7296b7ea63
    updateTeamsMutation.mutate(updatedTeams);

    // Remove assigned captains from pool
    const remainingCaptains = players.filter(p => 
<<<<<<< HEAD
      p.isCaptain && !updatedTeams.some(team => 
        team.players[0]?.id === p.id
      )
=======
      p.isCaptain && !sortedCaptains.slice(0, assignedCount).find(c => c.id === p.id)
>>>>>>> f1e350e7f4d0d7b316de72e89caafb7296b7ea63
    );
    const nonCaptains = players.filter(p => !p.isCaptain);
    queryClient.setQueryData(['players'], [...remainingCaptains, ...nonCaptains]);
  };

<<<<<<< HEAD
  // Update the autoAssignPlayers function
  const autoAssignPlayers = () => {
    // Get available regular players from pool
    const availablePlayers = [...players].filter(p => !p.isCaptain);
    if (availablePlayers.length === 0) return;
=======
  const autoAssignPlayers = () => {
    // Get available regular players from pool
    const availablePlayers = [...players].filter(p => !p.isCaptain);
    
    if (availablePlayers.length === 0) {
      return;
    }
>>>>>>> f1e350e7f4d0d7b316de72e89caafb7296b7ea63

    // Sort players by rank (highest to lowest)
    const sortedPlayers = [...availablePlayers].sort((a, b) => {
      const rankA = RANK_ORDER.indexOf(a.abbreviatedRank || 'B1');
      const rankB = RANK_ORDER.indexOf(b.abbreviatedRank || 'B1');
      return rankB - rankA;
    });

<<<<<<< HEAD
    // Create new teams array preserving team numbers
    const updatedTeams = teams.map(team => ({
      ...team,
      players: [...team.players], // Create new array for players
      teamNumber: team.teamNumber // Preserve team number
    }));

    // Distribute players to balance team ranks
    while (sortedPlayers.length > 0) {
      // Sort teams by current strength
      const incompleteTeams = updatedTeams
        .filter(team => team.players.length > 0 && team.players.length < teamSize)
        .sort((a, b) => {
          const avgRankA = getAverageTeamRank(a);
          const avgRankB = getAverageTeamRank(b);
          return avgRankA - avgRankB;
        });

      if (incompleteTeams.length === 0) break;

      // Add player to weakest team
      const weakestTeam = incompleteTeams[0];
      const player = sortedPlayers.shift();
      if (player) {
        const teamIndex = updatedTeams.findIndex(t => t.id === weakestTeam.id);
        updatedTeams[teamIndex].players.push(player);
      }
    }

    // Update teams locally
=======
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
    let assignedCount = 0;

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
            assignedCount++;
          }
        }
      }
    }

    // Update teams
>>>>>>> f1e350e7f4d0d7b316de72e89caafb7296b7ea63
    updateTeamsMutation.mutate(updatedTeams);

    // Update players pool with remaining players
    const captains = players.filter(p => p.isCaptain);
<<<<<<< HEAD
    queryClient.setQueryData(['players'], [...captains, ...sortedPlayers]);
=======
    const remainingPlayers = sortedPlayers;
    queryClient.setQueryData(['players'], [...captains, ...remainingPlayers]);
>>>>>>> f1e350e7f4d0d7b316de72e89caafb7296b7ea63
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

<<<<<<< HEAD
  // Update getTeamNumber to use the saved number if available
  const getTeamNumber = (teamIndex: number, totalTeams: number) => {
    const team = teams[teamIndex];
    if (team?.teamNumber) {
      return team.teamNumber;
    }
    
    // Fallback to calculated number
    if (teamIndex < Math.ceil(totalTeams/2)) {
      return String(teamIndex * 2 + 1).padStart(2, '0');
    } else {
=======
  // Update the getTeamNumber function to use the actual team index
  const getTeamNumber = (teamIndex: number, totalTeams: number) => {
    // For first column teams (0 to half)
    if (teamIndex < Math.ceil(totalTeams/2)) {
      return String(teamIndex * 2 + 1).padStart(2, '0');
    }
    // For second column teams (half to end)
    else {
>>>>>>> f1e350e7f4d0d7b316de72e89caafb7296b7ea63
      const adjustedIndex = teamIndex - Math.ceil(totalTeams/2);
      return String(adjustedIndex * 2 + 2).padStart(2, '0');
    }
  };

<<<<<<< HEAD
  // Move bracket state to the top with other state declarations
  const bracketDataRef = useRef<BracketData | null>(null);
  const [currentBracket, setCurrentBracket] = useState(initialState);
  const activeBracketId = queryClient.getQueryData(['activeBracketId']);

  // Use ref to prevent duplicate updates
  const updateInProgressRef = useRef(false);

  // Create empty teams array for clearing
  const createEmptyTeams = useCallback(() => {
    return Array.from({ length: numTeams }, (_, i) => {
      const teamNumber = i < Math.ceil(numTeams/2)
        ? i * 2 + 1  // Odd numbers (1,3,5,7)
        : (i - Math.ceil(numTeams/2)) * 2 + 2;  // Even numbers (2,4,6,8)
      
      return {
        id: `team-${Date.now()}-${i}`,
        name: `Team ${String(teamNumber).padStart(2, '0')}`,
        players: [],
        captains: [],
        teamNumber: String(teamNumber).padStart(2, '0')
      };
    });
  }, [numTeams]);

  const updateBracketMutation = useMutation({
    mutationFn: async (bracketData: BracketData) => {
      if (!activeBracketId || updateInProgressRef.current) return;
      updateInProgressRef.current = true;

      try {
        return await bracketOperations.save({
          bracketData,
          activeBracketId,
          teams,
          settings: {
            numTeams,
            teamSize,
            showTeamLogos,
            currentTheme,
            currentMode
          }
        });
      } finally {
        updateInProgressRef.current = false;
      }
    },
    onSuccess: (data) => {
      if (data && !isEqual(data, currentBracket)) {
        queryClient.invalidateQueries({ queryKey: ['brackets'] });
        setCurrentBracket(data);
        toast('Bracket updated successfully');
      }
    },
    onError: (error) => {
      console.error('Error updating bracket:', error);
      toast('Failed to update bracket');
    },
  });

  // Debounce the bracket data change handler
  const handleBracketDataChange = useCallback(
    debounce((bracketData: BracketData) => {
      console.log('Handling bracket data change:', bracketData);
      if (!isEqual(bracketDataRef.current, bracketData)) {
        bracketDataRef.current = bracketData;
        updateBracketMutation.mutate(bracketData);
      }
    }, 500),
    [updateBracketMutation]
  );

  // Update handleClearAll
  const handleClearAll = async () => {
    if (!window.confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      return;
    }

    try {
      // Clear database if we have an active bracket
      if (selectedBracketId) {
        const { error } = await supabase
          .from('Bracket')
          .update({
            data: {
              teams: teams.map(t => ({ ...t, players: [] })), // Keep teams but remove players
              players: [], // Clear players
              settings: {
                numTeams,
                teamSize,
                showRanks,
                showTeamLogos,
                currentTheme,
                mode: currentMode
              }
            },
            updated_at: new Date().toISOString()
          })
          .eq('id', selectedBracketId);

        if (error) throw error;
      }

      // Update local state
      queryClient.setQueryData(['teams'], teams.map(t => ({ ...t, players: [] })));
      queryClient.setQueryData(['players'], []);
      
      // Force refresh
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      queryClient.invalidateQueries({ queryKey: ['players'] });

      toast.success('All data cleared successfully');
    } catch (error) {
      console.error('Failed to clear data:', error);
      toast.error('Failed to clear data');
    }
  };

  const handleClearTeams = async () => {
    if (!window.confirm('Are you sure you want to clear all teams? Players will be moved back to the available list.')) {
      return;
    }

    try {
      // Get all players from teams
      const allTeamPlayers = teams.flatMap(t => t.players);
      
      // Update database if we have an active bracket
      if (selectedBracketId) {
        const { error } = await supabase
          .from('Bracket')
          .update({
            data: {
              teams: teams.map(t => ({ ...t, players: [] })), // Keep teams but remove players
              players: [...players, ...allTeamPlayers], // Move team players back to available list
              settings: {
                numTeams,
                teamSize,
                showRanks,
                showTeamLogos,
                currentTheme,
                mode: currentMode
              }
            },
            updated_at: new Date().toISOString()
          })
          .eq('id', selectedBracketId);

        if (error) throw error;
      }

      // Update local state
      queryClient.setQueryData(['teams'], teams.map(t => ({ ...t, players: [] })));
      queryClient.setQueryData(['players'], [...players, ...allTeamPlayers]);
      
      // Force refresh
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      queryClient.invalidateQueries({ queryKey: ['players'] });

      toast.success('Teams cleared successfully');
    } catch (error) {
      console.error('Failed to clear teams:', error);
      toast.error('Failed to clear teams');
=======
  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all lists? This cannot be undone.')) {
      queryClient.setQueryData(['players'], []);
      queryClient.setQueryData(['teams'], Array.from({ length: numTeams }, (_, i) => ({
        id: `team-${Date.now()}-${i}`,
        name: `Team ${i + 1}`,
        players: [],
      })));
>>>>>>> f1e350e7f4d0d7b316de72e89caafb7296b7ea63
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
<<<<<<< HEAD
        captains: [],
        teamNumber: String(teamNumber).padStart(2, '0')
=======
>>>>>>> f1e350e7f4d0d7b316de72e89caafb7296b7ea63
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

<<<<<<< HEAD
=======
  // Update where BracketsSection is used
  <BracketsSection
    mode={currentMode}
    teams={teams}
    numTeams={numTeams}
    teamSize={teamSize}
    showTeamLogos={showTeamLogos}
    onTeamsReorder={handleTeamsReorder}
  />

>>>>>>> f1e350e7f4d0d7b316de72e89caafb7296b7ea63
  // Add these state variables in the component
  const [savedBrackets, setSavedBrackets] = useState<SavedBracket[]>([]);
  const [isLoadDialogOpen, setIsLoadDialogOpen] = useState(false);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [newBracketName, setNewBracketName] = useState('');
<<<<<<< HEAD

  // Update the saveBracketMutation definition
  const saveBracketMutation = useMutation({
    mutationFn: ({ id, name, data }: { 
      id?: string; 
      name: string;
      data?: SavedBracket['data'];
    }) => mutationOperations.saveBracket.mutate({
      id,
      name,
      data,
      userId,
      defaultData: {
        players,
        teams,
        numTeams,
        teamSize,
        showRanks,
        showTeamLogos,
        currentTheme,
        currentMode,
        getTeamNumber
      }
    }),
    onSuccess: () => mutationOperations.saveBracket.onSuccess(queryClient),
=======
  const [selectedBracketId, setSelectedBracketId] = useState<string | null>(null);

  // Add these queries and mutations
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
        toast.error('Error loading brackets');
        return [];
      }

      return data as SavedBracket[];
    },
    enabled: !!userId,
  });

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
>>>>>>> f1e350e7f4d0d7b316de72e89caafb7296b7ea63
  });

  const loadBracketMutation = useMutation({
    mutationFn: async (bracketId: string) => {
<<<<<<< HEAD
      setSelectedBracketId(bracketId);
      return bracketOperations.load(bracketId);
    },
    onSuccess: (data) => {
=======
      const { data, error } = await supabase
        .from('Bracket')
        .select('*')
        .eq('id', bracketId)
        .single();

      if (error) throw error;
      return data as SavedBracket;
    },
    onSuccess: (data) => {
      // Update all states with loaded data
>>>>>>> f1e350e7f4d0d7b316de72e89caafb7296b7ea63
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
<<<<<<< HEAD
      toast.success({ title: 'Bracket loaded successfully' });
    },
    onError: () => {
      setSelectedBracketId(null); // Reset on error
      toast.error({ title: 'Error loading bracket' });
=======
      toast.success('Bracket loaded successfully');
    },
    onError: () => {
      toast.error('Error loading bracket');
>>>>>>> f1e350e7f4d0d7b316de72e89caafb7296b7ea63
    },
  });

  // Add these handler functions
  const handleSaveBracket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBracketName.trim()) {
      toast.error('Please enter a name for the bracket');
      return;
    }
<<<<<<< HEAD
    saveBracketMutation.mutate({ name: newBracketName.trim() });
  };

  // Add these computed values
  const availableCaptains = useMemo(() => 
    players.filter(p => p.isCaptain && !teams.some(t => 
      t.players.some(tp => tp.id === p.id)
    )), 
    [players, teams]
  );

  const availablePlayers = useMemo(() => 
    players.filter(p => !p.isCaptain && !teams.some(t => 
      t.players.some(tp => tp.id === p.id)
    )), 
    [players, teams]
  );

  // Update the handleLoadBracket function
  const handleLoadBracket = async (bracketId: string) => {
    try {
      const data = await bracketOperations.getBracket(bracketId);
      if (!data) return;

      // Set teams
      setTeams(data.data.teams || []);
      
      // Combine players and captains into a single list
      const allPlayers = [
        ...(data.data.players || []),  // Regular players
        ...(data.data.captains || [])  // Add captains
      ];

      // Set the combined list
      setPlayers(allPlayers);

      // Update settings
      if (data.data.settings) {
        setNumTeams(data.data.settings.numTeams);
        setTeamSize(data.data.settings.teamSize);
        setShowRanks(data.data.settings.showRanks);
        setShowTeamLogos(data.data.settings.showTeamLogos);
        setCurrentTheme(data.data.settings.currentTheme);
        setCurrentMode(data.data.settings.mode);
      }

      // Set bracket data if it exists
      if (data.bracket_data) {
        setBracketData(data.bracket_data);
      }

      setSelectedBracketId(bracketId);
      toast.success('Bracket loaded successfully');
    } catch (error) {
      console.error('Error loading bracket:', error);
      toast.error('Failed to load bracket');
    }
  };

  // Update the handleUpdateTeams function to preserve status
  const handleUpdateTeams = (newTeams: Captain[]) => {
    // Preserve existing team statuses when updating
    const updatedTeams = newTeams.map(newTeam => {
      const existingTeam = teams.find(t => t.id === newTeam.id);
      return {
        ...newTeam,
        status: existingTeam?.status || 'pending'
      };
    });
    
    updateTeamsMutation.mutate(updatedTeams);
  };

  // Update the logo management section
  {showTeamLogos && (
    <div className={`
      transition-all duration-300 ease-in-out overflow-hidden
      ${showTeamLogos 
        ? 'max-h-[1000px] opacity-100 transform translate-y-0' 
        : 'max-h-0 opacity-0 transform -translate-y-4'
      }
    `}>
      <Card className="bg-zinc-800/50 border-zinc-700/50 backdrop-blur-sm overflow-hidden">
        <div className="border-b border-zinc-700/50">
          <button
            onClick={() => setIsLogoSectionCollapsed(!isLogoSectionCollapsed)}
            className="w-full p-4 flex items-center justify-between hover:bg-zinc-700/20 transition-colors"
          >
            <div className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-zinc-400" />
              <h3 className="text-sm font-medium text-zinc-300">Team Logo Management</h3>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs text-zinc-500">Supported formats: PNG, JPG (max 2MB)</span>
              <ChevronDown 
                className={`w-4 h-4 text-zinc-400 transition-transform duration-200 
                  ${isLogoSectionCollapsed ? '' : 'rotate-180'}`}
              />
            </div>
          </button>
        </div>

        <div className={`transition-all duration-300 ease-in-out
          ${isLogoSectionCollapsed 
            ? 'max-h-0 opacity-0 transform translate-y-2' 
            : 'max-h-[1000px] opacity-100 transform translate-y-0'
          }`}
        >
          <div className="p-4 space-y-4">
            {/* Team Logo Grid */}
            <div className="grid grid-cols-4 gap-4">
              {/* Sort teams by teamNumber before mapping */}
              {[...teams]
                .sort((a, b) => {
                  const aNum = parseInt(a.teamNumber || '0');
                  const bNum = parseInt(b.teamNumber || '0');
                  return aNum - bNum;
                })
                .map((team) => (
                  <div 
                    key={team.id}
                    className="relative rounded-md border border-zinc-600/50 overflow-hidden"
                  >
                    {/* Background Image Container */}
                    <div className="absolute inset-0 w-full h-full">
                      <img 
                        src={`https://picsum.photos/400/400?random=${team.id}`}
                        alt="Team Logo Background"
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

                    {/* Content */}
                    <div className="relative z-10 flex items-center justify-between p-3 bg-zinc-800/50">
                      {/* Team Info */}
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="text-sm font-medium text-zinc-300 shrink-0">
                          Team {team.teamNumber}
                        </span>
                        <span className="text-sm text-zinc-400 truncate">
                          {team.name.replace(/^Team\s+/i, '')}
                        </span>
                      </div>

                      {/* Upload Area */}
                      <div className="flex items-center gap-2">
                        {/* Preview */}
                        <div className="w-10 h-10 rounded bg-zinc-700/50 border border-zinc-600/50 flex items-center justify-center overflow-hidden">
                          <img 
                            src={`https://picsum.photos/400/400?random=${team.id}`}
                            alt="Team Logo"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              const parent = e.currentTarget.parentElement;
                              if (parent) {
                                const icon = document.createElement('div');
                                icon.innerHTML = '<svg class="w-5 h-5 text-zinc-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>';
                                parent.appendChild(icon);
                              }
                            }}
                          />
                        </div>
                        
                        {/* Upload Button */}
                        <CustomButton
                          onClick={() => {
                            // TODO: Implement logo upload functionality
                            console.log('Upload logo for team:', team.id);
                          }}
                          className="text-xs bg-zinc-700/50 hover:bg-zinc-600/50 text-zinc-300"
                        >
                          Choose File
                        </CustomButton>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  )}

  // Add this interface to properly type the bracket data
  interface BracketData {
    matches: Record<string, 'pending' | 'live' | 'completed'>;
    scores: Record<string, [number, number]>;
    isGenerated: boolean;
  }

  // Add this state to track the selected bracket
  const [selectedBracket, setSelectedBracket] = useState<SavedBracket | null>(null);

  // Add auto-save effect
  useEffect(() => {
    if (!activeBracketId) return;

    const debouncedSave = setTimeout(async () => {
      try {
        await tournamentOperations.autoSave(activeBracketId, {
          teams,
          players,
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
        console.error('Auto-save failed:', error);
        toast.error('Failed to auto-save changes');
      }
    }, 1000); // Debounce for 1 second

    return () => clearTimeout(debouncedSave);
  }, [
    activeBracketId,
    teams,
    players,
    numTeams,
    teamSize,
    showRanks,
    showTeamLogos,
    currentTheme,
    currentMode
  ]);

  // Update the populate mutations
  const populateMutation = useMutation({
    mutationFn: async () => {
      if (!selectedBracketId) throw new Error('No active bracket selected');

      return mutationOperations.populate.mutate(
        selectedBracketId,
        {
          players,
          teams,
          numTeams,
          teamSize,
          showRanks,
          showTeamLogos,
          currentTheme,
          mode: currentMode
        }
      );
    },
    onSuccess: (result) => {
      toast.success('Teams populated successfully');
    },
    onError: (error) => {
      console.error('Error populating teams:', error);
      toast.error('Failed to populate teams');
    }
  });

  // Update auto-balance mutations
  const autoBalanceMutation = useMutation({
    mutationFn: async () => {
      if (!selectedBracketId) throw new Error('No active bracket selected');

      return mutationOperations.autoBalance.mutate(
        selectedBracketId,
        {
          players,
          teams,
          numTeams,
          teamSize,
          showRanks,
          showTeamLogos,
          currentTheme,
          mode: currentMode
        }
      );
    },
    onSuccess: (result) => {
      toast.success('Teams auto-balanced successfully');
    },
    onError: (error) => {
      console.error('Error auto-balancing teams:', error);
      toast.error('Failed to auto-balance teams');
    }
  });

  // Update the handlers
  const handlePopulate = () => {
    if (!selectedBracketId) {
      toast.error('No active bracket selected');
      return;
    }
    populateMutation.mutate();
  };

  const handleAutoBalance = () => {
    if (!selectedBracketId) {
      toast.error('No active bracket selected');
      return;
    }
    autoBalanceMutation.mutate();
  };

  // Inside your component, add this state
  const [removeDialogState, setRemoveDialogState] = useState<{
    playerId: string;
    teamId: string;
    playerName: string;
    isCaptain: boolean;
  } | null>(null);

  // Add this function to handle showing the dialog
  const handleShowRemoveDialog = (player: Player | Captain, teamId: string) => {
    console.log(' Show remove dialog:', { player, teamId });
    setRemoveDialogState({
      playerId: player.id,
      teamId: teamId,
      playerName: player.name,
      isCaptain: 'isCaptain' in player && player.isCaptain
    });
  };

  return (
    <>
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
                  setNumTeams={setNumTeams}
                  setTeamSize={setTeamSize}
                  setShowRanks={setShowRanks}
                  setShowTeamLogos={setShowTeamLogos}
                  setCurrentTheme={setCurrentTheme}
                  setCurrentMode={setCurrentMode}
                />
              </div>

              {/* Mode selector */}
              {modeSelector}

              {/* Add the brackets section here */}
              <BracketsSectionV2
                mode={currentMode as PickerMode}
                teams={teams}
                numTeams={numTeams}
                teamSize={teamSize}
                showTeamLogos={showTeamLogos}
                onTeamsReorder={handleUpdateTeams}
                bracketData={selectedBracketId ? currentBracket?.bracket_data : null}
                onBracketDataChange={handleBracketDataChange}
                currentBracket={selectedBracketId ? {
                  id: selectedBracketId,
                  data: {
                    teams,
                    players,
                    settings: {
                      mode: currentMode,
                      numTeams,
                      teamSize,
                      showRanks,
                      showTeamLogos,
                      currentTheme
                    }
                  },
                  bracket_data: currentBracket?.bracket_data ?? null
                } : null}
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
                onAddPlayer={handleAddPlayer}
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
                onClearAll={handleClearAll}
                showRanks={showRanks}
                setShowRanks={setShowRanks}
                userId={userId}
                players={players}
                activeBracketId={selectedBracketId}
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
                  <Droppable 
                    droppableId="captains"
                    isDropDisabled={false}
                    isCombineEnabled={false}
                  >
                    {(provided: DroppableProvided, snapshot: DroppableStateSnapshot) => (
                      <div 
                        {...provided.droppableProps} 
                        ref={provided.innerRef} 
                        className={`p-4 ${snapshot.isDraggingOver ? 'min-h-[50px]' : ''}`}
                      >
                        {isLoadingPlayers ? (
                          <div className="text-center py-4">Loading...</div>
                        ) : availableCaptains.length === 0 ? (
                          <div className="text-center py-4 text-zinc-400">
                            No captains available
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {availableCaptains.map((captain, index) => (
                              <Draggable
                                key={captain.id}
                                draggableId={captain.id}
                                index={index}
=======
    saveBracketMutation.mutate(newBracketName.trim());
  };

  const handleLoadBracket = (bracketId: string) => {
    loadBracketMutation.mutate(bracketId);
  };

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

  // Update the header section layout to include SaveLoadSection below the title
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
    />
  </div>

  // Update the main container and header layout
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
>>>>>>> f1e350e7f4d0d7b316de72e89caafb7296b7ea63
                              >
                                {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
<<<<<<< HEAD
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
                                      player={captain}
=======
                                    style={getDraggableStyle(snapshot.isDragging, provided.draggableProps.style)}
                                    className="transform-gpu"
                                  >
                                    <PlayerCard
                                      player={player}
>>>>>>> f1e350e7f4d0d7b316de72e89caafb7296b7ea63
                                      index={index}
                                      isDragging={snapshot.isDragging}
                                      style={{}}
                                      isCaptain={true}
<<<<<<< HEAD
                                      onRemove={handleShowRemoveDialog}
=======
                                      onRemove={handleRemovePlayer}
>>>>>>> f1e350e7f4d0d7b316de72e89caafb7296b7ea63
                                      onRankChange={handleRankChange}
                                      showRanks={showRanks}
                                    />
                                  </div>
                                )}
                              </Draggable>
<<<<<<< HEAD
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
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
=======
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
                                        : calculateTeamStatus(team).isFull
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
                                        : calculateTeamStatus(team).isFull
                                          ? 'Team is full'
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
>>>>>>> f1e350e7f4d0d7b316de72e89caafb7296b7ea63
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
<<<<<<< HEAD
                                          : calculateTeamStatus(team).current === 0
                                            ? 'bg-red-500/20 text-red-300'
                                            : calculateTeamStatus(team).current < calculateTeamStatus(team).required
                                              ? 'bg-yellow-500/20 text-yellow-300'
                                              : 'bg-zinc-700/50 text-zinc-400'
=======
                                          : calculateTeamStatus(team).isFull
                                            ? 'bg-yellow-500/20 text-yellow-300'
                                            : 'bg-zinc-700/50 text-zinc-400'
>>>>>>> f1e350e7f4d0d7b316de72e89caafb7296b7ea63
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
<<<<<<< HEAD
                                          : calculateTeamStatus(team).current === 0
                                            ? 'Team is empty'
=======
                                          : calculateTeamStatus(team).isFull
                                            ? 'Team is full'
>>>>>>> f1e350e7f4d0d7b316de72e89caafb7296b7ea63
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
<<<<<<< HEAD
                        <Droppable 
                          droppableId={`team-${team.id}`}
                          isDropDisabled={team.players.length >= teamSize}
                          isCombineEnabled={false}
                        >
=======
                        <Droppable droppableId={`team-${team.id}`}>
>>>>>>> f1e350e7f4d0d7b316de72e89caafb7296b7ea63
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
<<<<<<< HEAD
                                      isDragDisabled={player.isCaptain || (playerIndex === 0 && !player.isCaptain)} // Disable dragging for captains and non-captains at index 0
=======
                                      isDragDisabled={player.isCaptain}
>>>>>>> f1e350e7f4d0d7b316de72e89caafb7296b7ea63
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
<<<<<<< HEAD
                                            onRemove={handleShowRemoveDialog}
=======
                                            onRemove={(player, teamId) => handleRemovePlayerFromTeam(player, teamId)}
>>>>>>> f1e350e7f4d0d7b316de72e89caafb7296b7ea63
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
<<<<<<< HEAD
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
                          <Droppable 
                            droppableId={`team-${team.id}`}
                            isDropDisabled={team.players.length >= teamSize}
                            isCombineEnabled={false}
                          >
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
                                        isDragDisabled={player.isCaptain || (playerIndex === 0 && !player.isCaptain)} // Disable dragging for captains and non-captains at index 0
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
                                              onRemove={handleShowRemoveDialog}
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
                          {availablePlayers.length} / {calculateAvailablePlayerSlots(teams, numTeams, teamSize)}
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
                  <Droppable 
                    droppableId="players"
                    isDropDisabled={false}
                    isCombineEnabled={false}
                  >
                    {(provided: DroppableProvided, snapshot: DroppableStateSnapshot) => (
                      <div 
                        {...provided.droppableProps} 
                        ref={provided.innerRef} 
                        className={`p-4 ${snapshot.isDraggingOver ? 'min-h-[50px]' : ''}`}
                      >
                        {isLoadingPlayers ? (
                          <div className="text-center py-4">Loading...</div>
                        ) : availablePlayers.length === 0 ? (
                          <div className="text-center py-4 text-zinc-400">
                            No players available
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {availablePlayers.map((player, index) => (
=======
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
>>>>>>> f1e350e7f4d0d7b316de72e89caafb7296b7ea63
                              <Draggable
                                key={player.id}
                                draggableId={player.id}
                                index={index}
<<<<<<< HEAD
=======
                                isDragDisabled={areAllTeamsFull(teams, teamSize)}
>>>>>>> f1e350e7f4d0d7b316de72e89caafb7296b7ea63
                              >
                                {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
<<<<<<< HEAD
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
=======
                                    style={getDraggableStyle(snapshot.isDragging, provided.draggableProps.style)}
                                    className="transform-gpu"
>>>>>>> f1e350e7f4d0d7b316de72e89caafb7296b7ea63
                                  >
                                    <PlayerCard
                                      player={player}
                                      index={index}
                                      isDragging={snapshot.isDragging}
                                      style={{}}
<<<<<<< HEAD
                                      onRemove={handleShowRemoveDialog}
=======
                                      onRemove={handleRemovePlayer}
>>>>>>> f1e350e7f4d0d7b316de72e89caafb7296b7ea63
                                      onRankChange={handleRankChange}
                                      showRanks={showRanks}
                                    />
                                  </div>
                                )}
                              </Draggable>
<<<<<<< HEAD
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </div>
                    )}
                  </Droppable>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </DragDropContext>

      {/* Add the dialog component near the end of your render function */}
      <Dialog.Root 
        open={!!removeDialogState} 
        onOpenChange={(open) => !open && setRemoveDialogState(null)}
      >
        <Dialog.Portal>
          <Dialog.Content>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Remove {removeDialogState?.isCaptain ? 'Captain' : 'Player'}</DialogTitle>
                <DialogDescription>
                  Are you sure you want to remove {removeDialogState?.playerName} from the team?
                  They will be moved back to the available {removeDialogState?.isCaptain ? 'captains' : 'players'} list.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setRemoveDialogState(null)}>
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={async () => {
                    if (!removeDialogState) return;
                    
                    try {
                      await handleRemovePlayerFromTeam({
                        playerId: removeDialogState.playerId,
                        teamId: removeDialogState.teamId,
                        teams,
                        players,
                        activeBracketId: selectedBracketId,
                        settings: {
                          numTeams,
                          teamSize,
                          showRanks,
                          showTeamLogos,
                          currentTheme,
                          mode: currentMode
                        }
                      });
                      toast.success('Player removed successfully');
                    } catch (error) {
                      console.error('Failed to remove player:', error);
                      toast.error('Failed to remove player from team');
                    } finally {
                      setRemoveDialogState(null);
                    }
                  }}
                >
                  Remove
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
=======
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
>>>>>>> f1e350e7f4d0d7b316de72e89caafb7296b7ea63
  );
};

export default TeamPickerV2;