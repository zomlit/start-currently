import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@clerk/tanstack-start';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/utils/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Save, FolderOpen, ChevronDown, Plus, Trash2, MoreVertical, Loader2, Users, User, Settings2, Calendar, UserPlus, Clock, Copy, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { tournamentOperations } from '@/lib/team-picker/operations';
import { AnimatePresence, motion } from 'framer-motion';

interface Player {
  id: string;
  name: string;
  rank?: number;
}

interface Captain {
  id: string;
  name: string;
  players: Player[];
}

interface ThemePreset {
  name: string;
  description: string;
  generateColors: () => any;
}

type PickerMode = 'draft' | 'auto' | 'manual';

interface SavedBracketData {
  players: Player[];
  teams: Captain[];
  settings: {
    numTeams: number;
    teamSize: number;
    showRanks: boolean;
    showTeamLogos: boolean;
    currentTheme: ThemePreset;
    mode: PickerMode;
  };
}

interface SavedBracket {
  id: string;
  user_id: string;
  owner_id: string;
  name: string;
  data: SavedBracketData;
  is_complete: boolean;
  created_at: string;
  updated_at: string;
}

interface ToastOptions {
  title: string;
  description: string;
  variant?: 'default' | 'destructive' | 'success';
}

interface SaveLoadSectionProps {
  players: Player[];
  teams: Captain[];
  numTeams: number;
  teamSize: number;
  showRanks: boolean;
  showTeamLogos: boolean;
  currentTheme: ThemePreset;
  currentMode: PickerMode;
  onLoadBracket: (data: SavedBracket['data']) => void;
  activeBracketId: string | null;
  onBracketSelect: (bracketId: string) => void;
  setNumTeams: (value: number) => void;
  setTeamSize: (value: number) => void;
  setShowRanks: (value: boolean) => void;
  setShowTeamLogos: (value: boolean) => void;
  setCurrentTheme: (value: ThemePreset) => void;
  setCurrentMode: (value: PickerMode) => void;
}

interface SaveLoadSectionHandle {
  handleClearCurrentTournament: () => Promise<void>;
}

// Update style constants with hover-only colors
const dialogContentStyles = "bg-zinc-900/95 backdrop-blur-lg border border-zinc-800 shadow-2xl";
const dialogTitleStyles = "text-xl font-medium text-zinc-100";
const buttonBaseStyles = "transition-colors font-medium border";
const baseButtonStyle = "bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border-zinc-700";
const myGamesButtonStyles = cn(
  baseButtonStyle,
  "hover:bg-zinc-700 hover:border-zinc-600"
);
const newGameButtonStyles = cn(
  baseButtonStyle,
  "hover:bg-emerald-900/90 hover:border-emerald-800/50 hover:text-emerald-100"
);
const saveButtonStyles = cn(
  baseButtonStyle,
  "hover:bg-blue-900/90 hover:border-blue-800/50 hover:text-blue-100"
);
const saveAsButtonStyles = cn(
  baseButtonStyle,
  "hover:bg-indigo-900/90 hover:border-indigo-800/50 hover:text-indigo-100"
);
const destructiveButtonStyles = cn(
  baseButtonStyle,
  "hover:bg-red-900/90 hover:border-red-800 hover:text-red-100"
);
const buttonGroupStyles = "flex items-center gap-2";
const buttonContentStyles = "flex items-center gap-2";

// Update the input styles
const inputStyles = "bg-zinc-800/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:ring-blue-500/20";

// Update the dialog close button styles
const dialogCloseStyles = "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-zinc-100";

export function SaveLoadSection({
  players,
  teams,
  numTeams,
  teamSize,
  showRanks,
  showTeamLogos,
  currentTheme,
  currentMode,
  onLoadBracket,
  activeBracketId,
  onBracketSelect,
  setNumTeams,
  setTeamSize,
  setShowRanks,
  setShowTeamLogos,
  setCurrentTheme,
  setCurrentMode,
}: SaveLoadSectionProps): JSX.Element & SaveLoadSectionHandle {
  const { userId } = useAuth();
  const queryClient = useQueryClient();
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [tournamentName, setTournamentName] = useState('');
  const [selectedBracketId, setSelectedBracketId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadDialogOpen, setIsLoadDialogOpen] = useState(false);
  const [loadingBracketId, setLoadingBracketId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [bracketToDelete, setBracketToDelete] = useState<string | null>(null);
  const [isNewGameDialogOpen, setIsNewGameDialogOpen] = useState(false);
  const [newGameName, setNewGameName] = useState('');
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [duplicateBracketData, setDuplicateBracketData] = useState<{name: string, id: string} | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [isDuplicateDialogOpen, setIsDuplicateDialogOpen] = useState(false);
  const [bracketToDuplicate, setBracketToDuplicate] = useState<SavedBracket | null>(null);

  // Query to load saved brackets
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
        console.error('Error loading brackets:', error);
        toast({
          title: 'Error',
          description: 'Failed to load brackets',
          variant: 'destructive'
        });
        return [];
      }

      return data as SavedBracket[];
    },
    enabled: !!userId,
  });

  // Move console.log after brackets is defined
  console.log('SaveLoadSection props:', { activeBracketId, brackets });

  // Add delete mutation
  const deleteBracketMutation = useMutation({
    mutationFn: async (bracketId: string) => {
      // First clear all lists
      const { data: bracket } = await supabase
        .from('Bracket')
        .select('*')
        .eq('id', bracketId)
        .single();

      if (bracket) {
        // Clear the bracket data
        await supabase
          .from('Bracket')
          .update({
            data: {
              players: [],
              teams: Array.from({ length: numTeams }, (_, i) => ({
                id: `team-${i + 1}`,
                name: `Team ${String(i + 1).padStart(2, '0')}`,
                players: [],
                captains: []
              })),
              settings: {
                numTeams,
                teamSize,
                showRanks,
                showTeamLogos,
                currentTheme,
                mode: currentMode,
              }
            },
            bracket_data: null,
            updated_at: new Date().toISOString()
          })
          .eq('id', bracketId);
      }

      // Then delete the bracket
      const { error } = await supabase
        .from('Bracket')
        .delete()
        .eq('id', bracketId);

      if (error) throw error;

      // Clear local state
      queryClient.setQueryData(['teams'], []);
      queryClient.setQueryData(['players'], []);
      queryClient.setQueryData(['currentBracket'], null);
      if (onBracketSelect) {
        onBracketSelect(null);
      }
    },
    onSuccess: () => {
      toast.success({
        title: 'Success',
        description: 'Tournament deleted successfully'
      });
      queryClient.invalidateQueries({ queryKey: ['brackets'] });
      setIsDeleteDialogOpen(false);
      setBracketToDelete(null);
    },
    onError: () => {
      toast.error({
        title: 'Error',
        description: 'Failed to delete tournament'
      });
      setIsDeleteDialogOpen(false);
      setBracketToDelete(null);
    },
  });

  // Modified save mutation
  const saveBracketMutation = useMutation({
    mutationFn: async ({ name, data }: { name: string; data?: SavedBracketData }) => {
      if (!userId) throw new Error('Not authenticated');

      const bracketData = data || {
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

      // Create new bracket
      const { data: result, error } = await supabase
        .from('Bracket')
        .insert([{
          user_id: userId,
          owner_id: userId,
          name,
          data: bracketData,
          is_complete: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }])
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['brackets'] });
      toast.success('Tournament saved successfully');
    },
    onError: (error) => {
      console.error('Error saving tournament:', error);
      toast.error('Failed to save tournament');
    }
  });

  // Add new mutation for duplicating
  const duplicateBracketMutation = useMutation({
    mutationFn: async ({ bracketId, newName }: { bracketId: string, newName: string }) => {
      if (!userId) throw new Error('No user ID');
      return tournamentOperations.duplicateBracket(bracketId, newName, userId);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['brackets'] });
      toast.success('Tournament duplicated successfully');
      setIsConfirmDialogOpen(false);
      setDuplicateBracketData(null);
    },
    onError: (error) => {
      console.error('Error duplicating bracket:', error);
      toast.error('Failed to duplicate tournament');
    }
  });

  // Update the handleLoadBracket function
  const handleLoadBracket = useCallback(async (bracket: SavedBracket) => {
    try {
      setLoadingBracketId(bracket.id);

      // Clear current bracket data first
      queryClient.setQueryData(['currentBracket'], null);

      const loadedBracket = await tournamentOperations.getBracket(bracket.id);
      
      if (!loadedBracket) {
        toast.error('Bracket not found');
        return;
      }

      // Update state with loaded data
      if (loadedBracket.data) {
        const { teams, players, settings } = loadedBracket.data;
        
        // Update teams and players
        queryClient.setQueryData(['teams'], teams || []);
        queryClient.setQueryData(['players'], players || []);
        
        // Update settings
        if (settings) {
          setNumTeams(settings.numTeams);
          setTeamSize(settings.teamSize);
          setShowRanks(settings.showRanks);
          setShowTeamLogos(settings.showTeamLogos);
          setCurrentTheme(settings.currentTheme);
          setCurrentMode(settings.mode);
        }

        // Set the current bracket with its data
        queryClient.setQueryData(['currentBracket'], loadedBracket);

        // Set selected bracket ID
        if (onBracketSelect) {
          onBracketSelect(bracket.id);
        }

        toast.success('Bracket loaded successfully');
        setIsLoadDialogOpen(false);
      }
    } catch (error) {
      console.error('Error loading bracket:', error);
      toast.error('Failed to load bracket');
      
      // Clear everything on error
      queryClient.setQueryData(['currentBracket'], null);
      if (onBracketSelect) {
        onBracketSelect(null);
      }
    } finally {
      setLoadingBracketId(null);
    }
  }, [queryClient, onBracketSelect, setNumTeams, setTeamSize, setShowRanks, setShowTeamLogos, setCurrentTheme, setCurrentMode]);

  // Add this helper function to check for duplicate names
  const findBracketByName = (name: string) => {
    return brackets?.find(b => 
      b.name.toLowerCase() === name.toLowerCase() && 
      b.id !== selectedBracketId // Exclude current bracket when editing
    );
  };

  // Update the handleSave function
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = tournamentName.trim();
    
    if (!trimmedName) {
      toast.error({
        title: 'Error',
        description: 'Please enter a name for the tournament'
      });
      return;
    }

    // Check for existing bracket with same name
    const existingBracket = findBracketByName(trimmedName);
    
    if (existingBracket) {
      setDuplicateBracketData({
        name: trimmedName,
        id: existingBracket.id
      });
      setIsConfirmDialogOpen(true);
      return;
    }

    // No duplicate found, proceed with save
    saveBracketMutation.mutate({
      name: trimmedName,
      id: selectedBracketId || undefined
    });
  };

  // Add this function to handle confirmation
  const handleConfirmOverwrite = () => {
    if (duplicateBracketData) {
      saveBracketMutation.mutate({
        name: duplicateBracketData.name,
        id: duplicateBracketData.id
      });
      // Update the active bracket ID if needed
      onBracketSelect?.(duplicateBracketData.id);
      setIsConfirmDialogOpen(false);
      setDuplicateBracketData(null);
      setIsSaveDialogOpen(false);
    }
  };

  // Update the handleDirectSave function
  const handleDirectSave = async () => {
    if (!userId || !activeBracketId) return;

    try {
      // Get the current bracket
      const currentBracket = brackets?.find(b => b.id === activeBracketId);
      
      if (!currentBracket) {
        toast.error('No active tournament found');
        return;
      }

      // Update the existing bracket
      const { error } = await supabase
        .from('Bracket')
        .update({
          data: {
            players,
            teams,
            settings: {
              numTeams,
              teamSize,
              showRanks,
              showTeamLogos,
              currentTheme,
              mode: currentMode,
            }
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', activeBracketId);

      if (error) throw error;

      // Refresh the brackets list
      queryClient.invalidateQueries({ queryKey: ['brackets'] });
      toast.success('Tournament saved successfully');
    } catch (error) {
      console.error('Error saving tournament:', error);
      toast.error('Failed to save tournament');
    }
  };

  // Add this function to handle delete confirmation
  const handleDeleteConfirm = () => {
    if (bracketToDelete) {
      deleteBracketMutation.mutate(bracketToDelete);
      setIsDeleteDialogOpen(false);
      setBracketToDelete(null);
    }
  };

  // Add validation function
  const validateTournamentName = (name: string) => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setNameError('Please enter a tournament name');
      return false;
    }

    const existingTournament = brackets?.find(
      bracket => bracket.name.toLowerCase() === trimmedName.toLowerCase()
    );

    if (existingTournament) {
      setNameError('A tournament with this name already exists');
      return false;
    }

    setNameError(null);
    return true;
  };

  // Update the handleCreateNewGame function
  const handleCreateNewGame = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedName = newGameName.trim();
    
    if (!validateTournamentName(trimmedName)) {
      return;
    }

    try {
      const defaultData = {
        players: [],
        captains: [],
        teams: Array.from({ length: numTeams }, (_, i) => ({
          id: `team-${i + 1}`,
          name: `Team ${String(i + 1).padStart(2, '0')}`,
          players: [],
          captains: []
        })),
        settings: {
          numTeams,
          teamSize,
          showRanks,
          showTeamLogos,
          currentTheme,
          mode: currentMode,
        }
      };

      const { data: newBracket } = await supabase
        .from('Bracket')
        .insert([{
          user_id: userId,
          owner_id: userId,
          name: trimmedName,
          data: defaultData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }])
        .select()
        .single();

      if (newBracket) {
        queryClient.invalidateQueries({ queryKey: ['brackets'] });
        onBracketSelect?.(newBracket.id);
        setNewGameName('');
        setIsNewGameDialogOpen(false);
        toast.success('Tournament created successfully');
      }
    } catch (error) {
      console.error('Error creating tournament:', error);
      toast.error('Failed to create tournament');
    }
  };

  // Update the handleClearCurrentTournament function
  const handleClearCurrentTournament = async () => {
    if (!activeBracketId) return;

    try {
      // Get the current bracket
      const currentBracket = brackets?.find(b => b.id === activeBracketId);
      if (!currentBracket) return;

      // Create cleared data - keeping settings but clearing all player data
      const clearedData = {
        ...currentBracket.data,
        players: [], // Clear all players from the pool
        captains: [], // Clear all players from the pool
        teams: Array.from({ length: numTeams }, (_, i) => {
          const teamNumber = i < Math.ceil(numTeams/2)
            ? i * 2 + 1  // Odd numbers (1,3,5,7)
            : (i - Math.ceil(numTeams/2)) * 2 + 2;  // Even numbers (2,4,6,8)
          return {
            id: `team-${Date.now()}-${i}`,
            name: `Team ${String(teamNumber).padStart(2, '0')}`,
            players: [], // Empty players array
            captains: [], // Empty captains array
          };
        }),
        settings: {
          ...currentBracket.data.settings,
          numTeams,
          teamSize,
          showRanks,
          showTeamLogos,
          currentTheme,
          mode: currentMode,
        }
      };

      // Update the bracket with cleared data
      await saveBracketMutation.mutateAsync({
        id: activeBracketId,
        name: currentBracket.name,
        data: clearedData
      });

      // Update the UI with cleared data while maintaining the current tournament
      onLoadBracket(clearedData);
      
      // Ensure the tournament stays selected
      onBracketSelect?.(activeBracketId);

      toast.success({
        title: 'Success',
        description: 'All players and teams have been cleared from the current tournament'
      });
    } catch (error) {
      console.error('Error clearing tournament data:', error);
      toast.error({
        title: 'Error',
        description: 'Failed to clear tournament data'
      });
    }
  };

  // Update the duplicate button click handler
  const handleDuplicate = (bracket: SavedBracket) => {
    setBracketToDuplicate(bracket);
    setIsDuplicateDialogOpen(true);
  };

  // Add the confirmation handler
  const handleDuplicateConfirm = () => {
    if (bracketToDuplicate) {
      const newName = `${bracketToDuplicate.name} (Copy)`;
      duplicateBracketMutation.mutate({ 
        bracketId: bracketToDuplicate.id, 
        newName 
      });
      setIsDuplicateDialogOpen(false);
      setBracketToDuplicate(null);
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 1) return "bg-green-500";
    if (progress >= 0.75) return "bg-blue-500";
    if (progress >= 0.5) return "bg-yellow-500";
    if (progress >= 0.25) return "bg-orange-500";
    return "bg-red-500";
  };

  // Update the Save button click handler
  return (
    <div className="flex items-center">
      {/* Left side - My Games */}
      <Dialog open={isLoadDialogOpen} onOpenChange={setIsLoadDialogOpen}>
        <DialogTrigger asChild>
          <Button 
            variant="default" 
            className={cn(
              buttonBaseStyles,
              myGamesButtonStyles,
              buttonContentStyles,
              "min-w-[200px] justify-between"
            )}
            disabled={!userId}
          >
            <span className="flex items-center gap-2">
              <FolderOpen className="h-4 w-4" />
              <span className="flex items-center gap-1">
                My Games
                {activeBracketId && brackets?.find(b => b.id === activeBracketId)?.name && (
                  <>
                    <span className="text-zinc-500 mx-1">•</span>
                    <span className="text-zinc-300 truncate max-w-[120px]">
                      {brackets?.find(b => b.id === activeBracketId)?.name}
                    </span>
                  </>
                )}
              </span>
            </span>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </DialogTrigger>
        <DialogContent className={dialogContentStyles}>
          <DialogClose className={dialogCloseStyles}>
            <X className="h-4 w-4 text-zinc-100" />
            <span className="sr-only">Close</span>
          </DialogClose>
          <DialogHeader>
            <DialogTitle className={dialogTitleStyles}>Load Tournament</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
              </div>
            ) : brackets?.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-zinc-400">No tournaments found</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
                <AnimatePresence mode="popLayout">
                  {brackets?.map((bracket) => (
                    <motion.button
                      key={bracket.id}
                      layout
                      initial={{ opacity: 1, x: 0 }}
                      exit={{ 
                        opacity: 0, 
                        x: -100,
                        transition: { duration: 0.2 }
                      }}
                      onClick={() => handleLoadBracket(bracket)}
                      className={cn(
                        "w-full text-left p-4 rounded-lg",
                        "bg-zinc-800/50 hover:bg-zinc-800/80 transition-all",
                        "border border-zinc-700/30",
                        "group relative",
                        activeBracketId === bracket.id 
                          ? "bg-blue-500/10 border-blue-500/50" 
                          : "hover:border-blue-500/30"
                      )}
                    >
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <h3 className="font-medium text-zinc-100 flex items-center gap-2">
                            {bracket.name}
                            {activeBracketId === bracket.id && (
                              <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded">
                                Active
                              </span>
                            )}
                          </h3>
                          
                          {/* Stats Grid */}
                          {bracket.data?.settings && (
                            <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm text-zinc-400 mt-2">
                              {/* Teams Stats */}
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-blue-400" />
                                <span>
                                  Teams:{' '}
                                  <span className={cn(
                                    bracket.data.teams?.length === bracket.data.settings.numTeams 
                                      ? "text-green-400" 
                                      : bracket.data.teams?.length < bracket.data.settings.numTeams 
                                        ? "text-yellow-400"
                                        : "text-red-400"
                                  )}>
                                    {bracket.data.teams?.length || 0}
                                  </span>
                                  <span className={cn(
                                    bracket.data.teams?.length === bracket.data.settings.numTeams 
                                      ? "text-green-400" 
                                      : "text-zinc-500"
                                  )}>/{bracket.data.settings.numTeams}</span>
                                </span>
                              </div>

                              {/* Players Stats */}
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-green-400" />
                                <span>
                                  Players:{' '}
                                  <span className={cn(
                                    bracket.data.players?.length === (bracket.data.teams?.length * bracket.data.settings.teamSize)
                                      ? "text-green-400"
                                      : bracket.data.players?.length < (bracket.data.teams?.length * bracket.data.settings.teamSize)
                                        ? "text-yellow-400"
                                        : "text-red-400"
                                  )}>
                                    {bracket.data.players?.length || 0}
                                  </span>
                                  <span className={cn(
                                    bracket.data.players?.length === (bracket.data.teams?.length * bracket.data.settings.teamSize)
                                      ? "text-green-400"
                                      : "text-zinc-500"
                                  )}>/{(bracket.data.teams?.length || 0) * bracket.data.settings.teamSize}</span>
                                </span>
                              </div>

                              {/* Players Needed */}
                              <div className="flex items-center gap-2">
                                <UserPlus className="h-4 w-4 text-yellow-400" />
                                <span>
                                  Needed:{' '}
                                  <span className={cn(
                                    "font-medium",
                                    Math.max(0, (bracket.data.teams?.length * bracket.data.settings.teamSize) - bracket.data.players?.length) === 0
                                      ? "text-green-400"
                                      : "text-yellow-400"
                                  )}>
                                    {Math.max(0, (bracket.data.teams?.length * bracket.data.settings.teamSize) - bracket.data.players?.length)}
                                  </span>
                                </span>
                              </div>

                              {/* Team Size */}
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-purple-400" />
                                <span>
                                  Team Size: <span className="text-purple-400">{bracket.data.settings.teamSize}</span>
                                </span>
                              </div>

                              {/* Mode */}
                              <div className="flex items-center gap-2">
                                <Settings2 className="h-4 w-4 text-orange-400" />
                                <span>
                                  Mode: <span className="text-orange-400 capitalize">{bracket.data.settings.mode}</span>
                                </span>
                              </div>

                              {/* Last Updated */}
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-cyan-400" />
                                <span>
                                  Updated: <span className="text-cyan-400">
                                    {new Date(bracket.updated_at).toLocaleDateString()}
                                  </span>
                                </span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          {loadingBracketId === bracket.id ? (
                            <div className="flex items-center gap-2 text-zinc-400">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              <span className="text-sm">Loading...</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="opacity-0 group-hover:opacity-100 transition-opacity 
                                  text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700/50"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDuplicate(bracket);
                                }}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="icon"
                                className="opacity-0 group-hover:opacity-100 transition-opacity 
                                  text-zinc-400 hover:text-red-400 hover:bg-red-400/10"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setBracketToDelete(bracket.id);
                                  setIsDeleteDialogOpen(true);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Progress Bar */}
                      {bracket.data?.settings && bracket.data.teams?.length > 0 && (
                        <div className="mt-3">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-zinc-400">Progress</span>
                            <span className="text-zinc-400">
                              {Math.round((bracket.data.players?.length / (bracket.data.teams?.length * bracket.data.settings.teamSize)) * 100)}%
                            </span>
                          </div>
                          <div className="w-full bg-zinc-800/50 rounded-full h-1.5">
                            <div 
                              className={cn(
                                "h-1.5 rounded-full transition-all",
                                "bg-blue-500"  // Use solid blue instead of gradient
                              )}
                              style={{ 
                                width: `${(bracket.data.players?.length / (bracket.data.teams?.length * bracket.data.settings.teamSize)) * 100}%` 
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </motion.button>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 border-t border-border pt-4 mt-4">
            <Button 
              variant="default" 
              className={cn(
                buttonBaseStyles,
                newGameButtonStyles,
                buttonContentStyles,
                "flex-1"
              )}
              onClick={() => {
                setIsNewGameDialogOpen(true);
                setIsLoadDialogOpen(false);
              }}
            >
              <Plus className="h-4 w-4" />
              New Tournament
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Right side - Action Buttons with separator */}
      <div className={cn(buttonGroupStyles, "border-l border-zinc-800 ml-3 pl-3")}>
        {/* New Game Button */}
        <Button 
          variant="default"
          className={cn(
            buttonBaseStyles,
            newGameButtonStyles,
            buttonContentStyles
          )}
          onClick={() => setIsNewGameDialogOpen(true)}
        >
          <Plus className="h-4 w-4" />
          New Game
        </Button>

        {/* Save Button */}
        <Button 
          variant="default"
          className={cn(
            buttonBaseStyles,
            saveButtonStyles,
            buttonContentStyles
          )}
          disabled={!userId || !activeBracketId}
          onClick={handleDirectSave}
        >
          <Save className="h-4 w-4" />
          Save
        </Button>

        {/* Save As Button */}
        <Button 
          variant="default"
          className={cn(
            buttonBaseStyles,
            saveAsButtonStyles,
            buttonContentStyles
          )}
          disabled={!userId}
          onClick={() => {
            setSelectedBracketId(null);
            setTournamentName('');
            setIsSaveDialogOpen(true);
          }}
        >
          <Save className="h-4 w-4" />
          Save As...
        </Button>
      </div>

      {/* New Game Dialog */}
      <Dialog open={isNewGameDialogOpen} onOpenChange={setIsNewGameDialogOpen}>
        <DialogContent className={dialogContentStyles}>
          <DialogHeader>
            <DialogTitle className={dialogTitleStyles}>Create New Tournament</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateNewGame} className="space-y-4">
            <div className="space-y-2">
              <Input
                placeholder="Tournament Name"
                value={newGameName}
                onChange={(e) => {
                  setNewGameName(e.target.value);
                  validateTournamentName(e.target.value);
                }}
                className={cn(
                  inputStyles,
                  nameError && "border-red-500 focus-visible:ring-red-500"
                )}
                autoFocus
              />
              {nameError && (
                <div className="flex items-center gap-2 text-sm text-red-500">
                  <div className="w-1 h-1 rounded-full bg-red-500" />
                  {nameError}
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsNewGameDialogOpen(false)}
                className={cn(
                  buttonBaseStyles,
                  myGamesButtonStyles
                )}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!!nameError}
                className={cn(
                  buttonBaseStyles,
                  saveButtonStyles
                )}
              >
                Create
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Save As Dialog */}
      <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
        <DialogContent className={dialogContentStyles}>
          <DialogHeader>
            <DialogTitle className={dialogTitleStyles}>Save Tournament As</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Input
                placeholder="Tournament Name"
                value={tournamentName}
                onChange={(e) => setTournamentName(e.target.value)}
                className={inputStyles}
                autoFocus
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsSaveDialogOpen(false)}
                className={cn(
                  buttonBaseStyles,
                  myGamesButtonStyles
                )}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className={cn(
                  buttonBaseStyles,
                  saveButtonStyles
                )}
              >
                Save
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className={dialogContentStyles}>
          <DialogHeader>
            <DialogTitle className={cn(dialogTitleStyles, "text-red-400")}>
              Delete Tournament
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="flex items-start gap-3 text-zinc-300">
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <Trash2 className="h-5 w-5 text-red-400" />
              </div>
              <div className="space-y-2">
                <p className="font-medium text-red-400">
                  Are you sure you want to delete this tournament?
                </p>
                <ul className="space-y-2 text-sm text-zinc-400">
                  <li className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-red-400" />
                    All teams and player assignments will be permanently deleted
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-red-400" />
                    Tournament settings and progress will be lost
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-red-400" />
                    This action cannot be undone
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              className={cn(buttonBaseStyles, myGamesButtonStyles)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              className={cn(
                buttonBaseStyles, 
                destructiveButtonStyles,
                "bg-red-500/10 hover:bg-red-500/20"
              )}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Tournament
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Duplicate Confirmation Dialog */}
      <Dialog open={isDuplicateDialogOpen} onOpenChange={setIsDuplicateDialogOpen}>
        <DialogContent className={dialogContentStyles}>
          <DialogHeader>
            <DialogTitle className={cn(dialogTitleStyles, "text-blue-400")}>
              Duplicate Tournament
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="flex items-start gap-3 text-zinc-300">
              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <Copy className="h-5 w-5 text-blue-400" />
              </div>
              <div className="space-y-2">
                <p className="font-medium text-blue-400">
                  Are you sure you want to duplicate "{bracketToDuplicate?.name}"?
                </p>
                <ul className="space-y-2 text-sm text-zinc-400">
                  <li className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-blue-400" />
                    A new tournament will be created with "(Copy)" added to the name
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-blue-400" />
                    All teams, players, and settings will be copied
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-blue-400" />
                    The original tournament will remain unchanged
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsDuplicateDialogOpen(false);
                setBracketToDuplicate(null);
              }}
              className={cn(buttonBaseStyles, myGamesButtonStyles)}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={handleDuplicateConfirm}
              className={cn(
                buttonBaseStyles, 
                saveButtonStyles,
                "bg-blue-500/10 hover:bg-blue-500/20"
              )}
            >
              <Copy className="h-4 w-4 mr-2" />
              Duplicate Tournament
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 