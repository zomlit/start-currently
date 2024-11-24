import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/tanstack-start';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/utils/supabase/client';
import { toast } from '@/utils/toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Save, FolderOpen, ChevronDown, Plus, Trash2, MoreVertical } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Player, Captain, ThemePreset, PickerMode } from '@/types/team-picker';
import type { SavedBracket } from './types';

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
}: SaveLoadSectionProps) {
  const { userId } = useAuth();
  const queryClient = useQueryClient();
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [tournamentName, setTournamentName] = useState('');
  const [selectedBracketId, setSelectedBracketId] = useState<string | null>(null);

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
    mutationFn: async ({ name, id }: { name: string; id?: string }) => {
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

      if (id) {
        // Update existing bracket
        const { data, error } = await supabase
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
        return data;
      } else {
        // Create new bracket
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
      }
    },
    onSuccess: () => {
      toast.success({
        title: 'Success',
        description: 'Tournament saved successfully'
      });
      setIsSaveDialogOpen(false);
      setTournamentName('');
      queryClient.invalidateQueries({ queryKey: ['brackets'] });
    },
    onError: () => {
      toast.error({
        title: 'Error',
        description: 'Failed to save tournament'
      });
    },
  });

  // Update the loadBracketMutation
  const loadBracketMutation = useMutation({
    mutationFn: async (bracketId: string) => {
      if (!userId) return null;
      
      console.log('Loading bracket with ID:', bracketId);
      
      // Try to get from cache first
      const cachedBracket = brackets?.find(b => b.id === bracketId);
      if (cachedBracket) {
        console.log('Found bracket in cache:', cachedBracket);
        return cachedBracket;
      }
      
      // Otherwise fetch from Supabase
      const { data, error } = await supabase
        .from('Bracket')
        .select()
        .eq('id', bracketId)
        .single();

      if (error) {
        console.error('Load error:', error);
        throw error;
      }

      if (!data) {
        throw new Error('Tournament not found');
      }
      
      return data as SavedBracket;
    },
    onSuccess: (data) => {
      if (!data) return;
      
      console.log('Successfully loaded data:', data);
      console.log('Data to be passed to parent:', data.data);
      
      // Load the data
      onLoadBracket(data.data);
      
      toast.success({
        title: 'Success',
        description: 'Tournament loaded successfully'
      });
    },
    onError: (error) => {
      console.error('Load error:', error);
      toast.error({
        title: 'Error',
        description: 'Failed to load tournament'
      });
    },
  });

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

  // Update the handleLoadBracket function
  const handleLoadBracket = (bracketId: string) => {
    console.log('Attempting to load bracket:', bracketId);
    loadBracketMutation.mutate(bracketId);
    if (onBracketSelect) {
      onBracketSelect(bracketId);
    }
  };

  // Update the handleDirectSave function
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

  // Add this function inside the SaveLoadSection component
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tournamentName.trim()) {
      toast.error({
        title: 'Error',
        description: 'Please enter a name for the tournament'
      });
      return;
    }

    saveBracketMutation.mutate({
      name: tournamentName.trim(),
      id: selectedBracketId || undefined
    });
  };

  // Update the Save button click handler
  return (
    <div className="flex items-center gap-2">
      {/* Tournament Selector Dropdown */}
      <Popover>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            className="gap-2 bg-zinc-800 border-zinc-700 hover:bg-zinc-700 hover:border-zinc-600 text-zinc-100"
            disabled={!userId}
          >
            <FolderOpen className="h-4 w-4" />
            <span className="truncate max-w-[200px]">
              {activeBracketId && brackets && brackets.length > 0
                ? brackets.find(b => b.id === activeBracketId)?.name || 'My Tournaments'
                : 'My Tournaments'
              }
            </span>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-[350px] p-0 bg-zinc-900 border border-zinc-700" 
          align="start"
          sideOffset={5}
        >
          <div className="p-2">
            <div className="space-y-1">
              {!brackets?.length ? (
                <div className="text-center py-4 text-zinc-400">
                  No saved tournaments found
                </div>
              ) : (
                brackets.map((bracket) => (
                  <div
                    key={bracket.id}
                    className={`flex items-center justify-between px-3 py-2 rounded-md 
                      hover:bg-zinc-800 transition-colors group
                      ${activeBracketId === bracket.id ? 'bg-zinc-800 ring-1 ring-zinc-600' : ''}`}
                  >
                    <button
                      onClick={() => handleLoadBracket(bracket.id)}
                      className="flex-1 text-left"
                    >
                      <div className="font-medium text-zinc-100">{bracket.name}</div>
                      <div className="text-xs text-zinc-400">
                        Last updated: {new Date(bracket.updated_at).toLocaleDateString()}
                      </div>
                    </button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent 
                        align="end" 
                        className="bg-zinc-900 border border-zinc-700"
                      >
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedBracketId(bracket.id);
                            setTournamentName(bracket.name);
                            setIsSaveDialogOpen(true);
                          }}
                          className="text-zinc-100 hover:bg-zinc-800 focus:bg-zinc-800"
                        >
                          <Save className="h-4 w-4 mr-2" />
                          Save As
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this tournament?')) {
                              deleteBracketMutation.mutate(bracket.id);
                            }
                          }}
                          className="text-red-400 hover:bg-zinc-800 hover:text-red-300 focus:bg-zinc-800 focus:text-red-300"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Save Button - Now only does direct save */}
      <Button 
        variant="outline" 
        className="gap-2 bg-zinc-800 border-zinc-700 hover:bg-zinc-700 hover:border-zinc-600 text-zinc-100"
        disabled={!userId || !activeBracketId}
        onClick={handleDirectSave}
      >
        <Save className="h-4 w-4" />
        Save
      </Button>

      {/* Save As Button - Always opens dialog */}
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
        <Plus className="h-4 w-4" />
        Save As
      </Button>

      {/* Save Dialog */}
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
    </div>
  );
} 