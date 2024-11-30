import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/tanstack-start';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/utils/supabase/client';
import { toast } from '@/utils/toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Save, FolderOpen, ChevronDown, Plus, Trash2, MoreVertical, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

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
  onBracketSelect?: (id: string | null) => void;
}

interface SaveLoadSectionHandle {
  handleClearCurrentTournament: () => Promise<void>;
}

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
      const { error } = await supabase
        .from('Bracket')
        .delete()
        .eq('id', bracketId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success({
        title: 'Success',
        description: 'Tournament deleted successfully'
      });
      queryClient.invalidateQueries({ queryKey: ['brackets'] });
    },
    onError: () => {
      toast.error({
        title: 'Error',
        description: 'Failed to delete tournament'
      });
    },
  });

  // Modified save mutation
  const saveBracketMutation = useMutation({
    mutationFn: async ({ name, id, data }: { 
      name: string; 
      id?: string;
      data?: {
        players: any[];
        teams: any[];
        settings: {
          numTeams: number;
          teamSize: number;
          showRanks: boolean;
          showTeamLogos: boolean;
          currentTheme: any;
          mode: any;
        };
      };
    }) => {
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

      if (id) {
        // Update existing bracket
        const { data: result, error } = await supabase
          .from('Bracket')
          .update({
            name,
            data: bracketData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        return result;
      } else {
        // Create new bracket
        const { data: result, error } = await supabase
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
        return result;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brackets'] });
    },
  });

  // Update the handleLoadBracket function
  const handleLoadBracket = async (bracketId: string) => {
    setLoadingBracketId(bracketId);
    try {
      console.log('Attempting to load bracket:', bracketId);
      const { data: bracketData, error } = await supabase
        .from('Bracket')
        .select('*')
        .eq('id', bracketId)
        .single();

      if (error) throw error;
      if (!bracketData) throw new Error('No data found');

      console.log('Successfully loaded data:', bracketData);
      
      // Call the parent's handler with the bracket data
      onLoadBracket(bracketData.data);
      // Update the active bracket ID
      onBracketSelect(bracketId);
      setIsLoadDialogOpen(false);
      toast.success('Tournament loaded successfully');
    } catch (error) {
      console.error('Error loading bracket:', error);
      toast.error('Failed to load bracket');
    } finally {
      setLoadingBracketId(null);
    }
  };

  // Add auto-save effect
  useEffect(() => {
    if (!activeBracketId || !userId) return;

    const debouncedSave = setTimeout(() => {
      saveBracketMutation.mutate({
        id: activeBracketId,
        name: brackets?.find(b => b.id === activeBracketId)?.name || 'Untitled Tournament'
      });
    }, 1000); // Debounce for 1 second

    return () => clearTimeout(debouncedSave);
  }, [
    activeBracketId,
    players,
    teams,
    numTeams,
    teamSize,
    showRanks,
    showTeamLogos,
    currentTheme,
    currentMode
  ]);

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

  // Add this function inside the SaveLoadSection component
  const handleDirectSave = () => {
    if (!activeBracketId) {
      // If no active bracket, open dialog for new save
      setSelectedBracketId(null);
      setTournamentName('');
      setIsSaveDialogOpen(true);
      return;
    }

    // Get the current bracket name
    const currentBracket = brackets?.find(b => b.id === activeBracketId);
    if (!currentBracket) {
      toast({
        title: 'Error',
        description: 'Could not find current tournament',
        variant: 'destructive'
      });
      return;
    }

    // Save directly with current name
    saveBracketMutation.mutate({
      id: activeBracketId,
      name: currentBracket.name
    });
  };

  // Add this function to handle delete confirmation
  const handleDeleteConfirm = () => {
    if (bracketToDelete) {
      deleteBracketMutation.mutate(bracketToDelete);
      setIsDeleteDialogOpen(false);
      setBracketToDelete(null);
    }
  };

  // Update the handleCreateNewGame function
  const handleCreateNewGame = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = newGameName.trim();
    
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
      toast.error({
        title: 'Error',
        description: `A tournament with name "${trimmedName}" already exists. Please choose a different name.`
      });
      return;
    }

    try {
      // Create new game with empty players but keep the team structure
      const initialTeams = Array.from({ length: numTeams }, (_, i) => {
        const teamNumber = i < Math.ceil(numTeams/2)
          ? i * 2 + 1  // Odd numbers (1,3,5,7)
          : (i - Math.ceil(numTeams/2)) * 2 + 2;  // Even numbers (2,4,6,8)
        return {
          id: `team-${Date.now()}-${i}`,
          name: `Team ${String(teamNumber).padStart(2, '0')}`,
          players: [], // Empty players array
        };
      });

      // Create new bracket data
      const newBracketData = {
        players: [], // Empty players array
        teams: initialTeams,
        settings: {
          numTeams,
          teamSize,
          showRanks,
          showTeamLogos,
          currentTheme,
          mode: currentMode,
        }
      };
      
      // Save as new bracket and get the result
      const result = await saveBracketMutation.mutateAsync({
        name: trimmedName,
        data: newBracketData // Include the full bracket data
      });

      // Set the new bracket as active
      if (result?.id) {
        onBracketSelect?.(result.id);
        // Load the new bracket data
        onLoadBracket(newBracketData);
      }
      
      setNewGameName('');
      setIsNewGameDialogOpen(false);

      toast.success({
        title: 'Success',
        description: 'New tournament created successfully'
      });
    } catch (error) {
      console.error('Error creating new game:', error);
      toast.error({
        title: 'Error',
        description: 'Failed to create new tournament'
      });
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
        teams: Array.from({ length: numTeams }, (_, i) => {
          const teamNumber = i < Math.ceil(numTeams/2)
            ? i * 2 + 1  // Odd numbers (1,3,5,7)
            : (i - Math.ceil(numTeams/2)) * 2 + 2;  // Even numbers (2,4,6,8)
          return {
            id: `team-${Date.now()}-${i}`,
            name: `Team ${String(teamNumber).padStart(2, '0')}`,
            players: [], // Empty players array
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

  // Update the Save button click handler
  return (
    <div className="flex items-center gap-4">
      <Dialog open={isLoadDialogOpen} onOpenChange={setIsLoadDialogOpen}>
        <DialogTrigger asChild>
          <Button 
            variant="outline" 
            className="gap-2 bg-zinc-800 border-zinc-700 hover:bg-zinc-700 hover:border-zinc-600 text-zinc-100"
            disabled={!userId}
          >
            <FolderOpen className="h-4 w-4" />
            {activeBracketId 
              ? `My Games: ${brackets?.find(b => b.id === activeBracketId)?.name || 'Untitled'}`
              : 'My Games'
            }
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-zinc-900 border border-zinc-700">
          <DialogHeader>
            <DialogTitle className="text-zinc-100">My Games</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {!brackets?.length ? (
              <div className="text-center py-4 text-zinc-400">
                No saved tournaments found
              </div>
            ) : (
              <div className="space-y-2">
                {brackets.map((bracket) => (
                  <div
                    key={bracket.id}
                    className="w-full p-3 text-left rounded-lg border border-zinc-700/50 
                      hover:bg-zinc-700/50 transition-colors group"
                  >
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => handleLoadBracket(bracket.id)}
                        className="flex-1 text-left"
                        disabled={loadingBracketId === bracket.id}
                      >
                        <div>
                          <h3 className="font-medium text-zinc-100">{bracket.name}</h3>
                          <p className="text-sm text-zinc-400">
                            Last updated: {new Date(bracket.updated_at).toLocaleDateString()}
                          </p>
                        </div>
                      </button>
                      <div className="flex items-center gap-2">
                        {loadingBracketId === bracket.id ? (
                          <div className="flex items-center gap-2 text-zinc-400">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="text-sm">Loading...</span>
                          </div>
                        ) : (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-zinc-400 
                              hover:text-red-400 hover:bg-red-400/10"
                            onClick={(e) => {
                              e.stopPropagation();
                              setBracketToDelete(bracket.id);
                              setIsDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <div className="flex items-center gap-2 border-l border-zinc-700/50 pl-4">
        <Button 
          variant="outline" 
          className="gap-2 bg-zinc-800 border-zinc-700 hover:bg-zinc-700 hover:border-zinc-600 text-zinc-100"
          disabled={!userId}
          onClick={() => setIsNewGameDialogOpen(true)}
        >
          <Plus className="h-4 w-4" />
          New Game
        </Button>

        <Button 
          variant={activeBracketId ? "default" : "outline"}
          className={`gap-2 ${activeBracketId 
            ? "bg-blue-600 hover:bg-blue-700 text-white" 
            : "bg-zinc-800 border-zinc-700 hover:bg-zinc-700 hover:border-zinc-600 text-zinc-100"
          }`}
          disabled={!userId || !activeBracketId}
          onClick={handleDirectSave}
        >
          <Save className="h-4 w-4" />
          Save
        </Button>

        <Button 
          variant="outline" 
          className="gap-2 bg-zinc-800 border-zinc-700 hover:bg-zinc-700 hover:border-zinc-600 text-zinc-100"
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

      <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
        <DialogContent className="bg-zinc-900 border border-zinc-700">
          <DialogHeader>
            <DialogTitle className="text-zinc-100">
              {selectedBracketId ? 'Save Tournament As' : 'Save Tournament'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label htmlFor="tournamentName" className="text-sm font-medium text-zinc-200">
                Tournament Name
              </label>
              <Input
                id="tournamentName"
                value={tournamentName}
                onChange={(e) => setTournamentName(e.target.value)}
                placeholder="Enter tournament name..."
                className="mt-1 bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500
                  focus:ring-zinc-600 focus:border-zinc-600"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsSaveDialogOpen(false)}
                className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700 hover:border-zinc-600 text-zinc-100"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!tournamentName.trim() || saveBracketMutation.isPending}
                className="bg-zinc-700 hover:bg-zinc-600 text-zinc-100 disabled:bg-zinc-800 
                  disabled:text-zinc-500 disabled:border-zinc-700"
              >
                {saveBracketMutation.isPending ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-zinc-900 border border-zinc-700">
          <DialogHeader>
            <DialogTitle className="text-zinc-100">Delete Tournament</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-zinc-300">
              Are you sure you want to delete this tournament? This action cannot be undone.
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setBracketToDelete(null);
              }}
              className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700 hover:border-zinc-600 text-zinc-100"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700 text-white border-none"
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isNewGameDialogOpen} onOpenChange={setIsNewGameDialogOpen}>
        <DialogContent className="bg-zinc-900 border border-zinc-700">
          <DialogHeader>
            <DialogTitle className="text-zinc-100">Create New Tournament</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateNewGame} className="space-y-4">
            <div>
              <label htmlFor="newGameName" className="text-sm font-medium text-zinc-200">
                Tournament Name
              </label>
              <Input
                id="newGameName"
                value={newGameName}
                onChange={(e) => setNewGameName(e.target.value)}
                placeholder="Enter tournament name..."
                className="mt-1 bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500
                  focus:ring-zinc-600 focus:border-zinc-600"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsNewGameDialogOpen(false);
                  setNewGameName('');
                }}
                className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700 hover:border-zinc-600 text-zinc-100"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!newGameName.trim() || saveBracketMutation.isPending}
                className="bg-zinc-700 hover:bg-zinc-600 text-zinc-100 disabled:bg-zinc-800 
                  disabled:text-zinc-500 disabled:border-zinc-700"
              >
                {saveBracketMutation.isPending ? 'Creating...' : 'Create'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent className="bg-zinc-900 border border-zinc-700">
          <DialogHeader>
            <DialogTitle className="text-zinc-100">Update Existing Tournament</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-zinc-300">
              A tournament with name "{duplicateBracketData?.name}" already exists. 
              Do you want to update it instead?
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsConfirmDialogOpen(false);
                setDuplicateBracketData(null);
              }}
              className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700 hover:border-zinc-600 text-zinc-100"
            >
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={handleConfirmOverwrite}
              className="bg-blue-600 hover:bg-blue-700 text-white border-none"
            >
              Update
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 