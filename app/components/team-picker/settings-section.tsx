import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import * as Switch from '@radix-ui/react-switch';
import * as Label from '@radix-ui/react-label';
import * as Separator from '@radix-ui/react-separator';
import { CustomButton } from '@/components/ui/custom-button';
import { Paintbrush, ImageIcon, X, ChevronDown, Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { colorThemes } from '../../utils/colorThemes';
import type { ThemePreset, PickerMode } from '@/types/team-picker';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { Captain, Player } from '@/types/team-picker';
import { toast } from 'sonner';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { mutationOperations } from '@/lib/team-picker/operations';
import { cn } from '@/lib/utils';

interface SettingsSectionProps {
  newName: string;
  setNewName: (name: string) => void;
  isAddingCaptain: boolean;
  setIsAddingCaptain: (value: boolean) => void;
  teamSize: number;
  handleTeamSizeChange: (size: number) => void;
  numTeams: number;
  handleUpdateNumTeams: (num: number) => void;
  handleAddPlayerWithMutation: (e: React.FormEvent) => void;
  addPlayerMutationPending: boolean;
  handlePopulateCaptains: () => void;
  handlePopulatePlayers: () => void;
  handlePopulate: () => void;
  autoAssignCaptains: () => void;
  autoAssignPlayers: () => void;
  isCaptainsFull: boolean;
  isPlayersFull: boolean;
  isAllPlayersFull: boolean;
  hasCaptains: boolean;
  hasPlayers: boolean;
  currentTheme: ThemePreset;
  setCurrentTheme: (theme: ThemePreset) => void;
  showTeamLogos: boolean;
  setShowTeamLogos: (show: boolean) => void;
  isLogoSectionCollapsed?: boolean;
  setIsLogoSectionCollapsed?: (collapsed: boolean) => void;
  onClearAll: () => void;
  teams: Captain[];
  getTeamNumber: (teamIndex: number, totalTeams: number) => string;
  showRanks: boolean;
  setShowRanks: (show: boolean) => void;
  userId: string;
  players: Player[];
  activeBracketId: string | null;
  onAddPlayer: (e: React.FormEvent) => void;
}

const SettingsSection: React.FC<SettingsSectionProps> = ({
  newName,
  setNewName,
  isAddingCaptain,
  setIsAddingCaptain,
  teamSize,
  handleTeamSizeChange,
  numTeams,
  handleUpdateNumTeams,
  handleAddPlayerWithMutation,
  addPlayerMutationPending,
  handlePopulateCaptains,
  handlePopulatePlayers,
  handlePopulate,
  autoAssignCaptains,
  autoAssignPlayers,
  isCaptainsFull,
  isPlayersFull,
  isAllPlayersFull,
  hasCaptains,
  hasPlayers,
  currentTheme,
  setCurrentTheme,
  showTeamLogos,
  setShowTeamLogos,
  isLogoSectionCollapsed = false,
  setIsLogoSectionCollapsed = () => {},
  onClearAll,
  teams,
  getTeamNumber,
  showRanks,
  setShowRanks,
  userId,
  players,
  activeBracketId,
  onAddPlayer,
}) => {
  const [isClearDialogOpen, setIsClearDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const autoAssignCaptainsMutation = useMutation({
    mutationFn: () => mutationOperations.autoAssignCaptains.mutate({
      bracketId: activeBracketId!,
      captains: players.filter(p => p.isCaptain),
      teams
    }),
    onSuccess: (result) => {
      mutationOperations.autoAssignCaptains.onSuccess(result, queryClient);
      toast.success('Captains auto-balanced successfully');
    },
    onError: () => {
      toast.error('Failed to auto-balance captains');
    }
  });

  const autoAssignPlayersMutation = useMutation({
    mutationFn: () => mutationOperations.autoAssignPlayers.mutate({
      bracketId: activeBracketId!,
      players: players.filter(p => !p.isCaptain),
      teams,
      teamSize
    }),
    onSuccess: (result) => {
      mutationOperations.autoAssignPlayers.onSuccess(result, queryClient);
      toast.success('Players auto-balanced successfully');
    },
    onError: () => {
      toast.error('Failed to auto-balance players');
    }
  });

  const handleAutoAssignCaptains = () => {
    if (!activeBracketId) {
      toast.error('No active bracket selected');
      return;
    }
    autoAssignCaptainsMutation.mutate();
  };

  const handleAutoAssignPlayers = () => {
    if (!activeBracketId) {
      toast.error('No active bracket selected');
      return;
    }
    autoAssignPlayersMutation.mutate();
  };

  const handleAutoAssignAll = () => {
    handleAutoAssignCaptains();
    handleAutoAssignPlayers();
  };

  // Add this helper function to sort teams
  const sortTeamsByNumber = (teamsToSort: Captain[]) => {
    return [...teamsToSort].sort((a, b) => {
      const aNum = parseInt(a.teamNumber || '0');
      const bNum = parseInt(b.teamNumber || '0');
      return aNum - bNum;
    });
  };

  // Add clearBracket mutation
  const clearBracketMutation = useMutation({
    mutationFn: () => mutationOperations.clearBracket.mutate({
      bracketId: activeBracketId!,
      emptyTeams: Array(numTeams).fill(null).map((_, i) => ({
        id: `team-${i + 1}`,
        name: `Team ${i + 1}`,
        players: [],
        captains: []
      })),
      settings: {
        numTeams,
        teamSize,
        showRanks,
        showTeamLogos,
        currentTheme,
        mode: 'tournament' as PickerMode
      }
    }),
    onSuccess: (result) => {
      mutationOperations.clearBracket.onSuccess(result, queryClient);
      toast.success('All lists cleared successfully');
      setIsClearDialogOpen(false);
      onClearAll();
    },
    onError: () => {
      toast.error('Failed to clear lists');
      setIsClearDialogOpen(false);
    }
  });

  // Local handler for clear operation
  const handleClear = () => {
    if (!activeBracketId) {
      toast.error('No active bracket selected');
      return;
    }
    clearBracketMutation.mutate();
  };

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

  // Add this mutation to handle player/captain addition with auto-save
  const addPlayerMutation = useMutation({
    mutationFn: async (player: Player) => {
      if (!activeBracketId) throw new Error('No active bracket selected');

      return mutationOperations.addPlayer.mutate(
        player, 
        userId,
        activeBracketId,
        {
          players,
          teams,
          numTeams,
          teamSize,
          showRanks,
          showTeamLogos,
          currentTheme,
          mode: 'tournament' as PickerMode
        }
      );
    },
    onSuccess: (newPlayer) => {
      mutationOperations.addPlayer.onSuccess(newPlayer, queryClient);
      toast.success(`${newPlayer.isCaptain ? 'Captain' : 'Player'} added successfully`);
    },
    onError: (error) => {
      console.error('Error adding player:', error);
      toast.error(`Failed to add ${isAddingCaptain ? 'captain' : 'player'}`);
    }
  });

  return (
    <div className="space-y-4">
      <Card className="bg-zinc-800/50 border-zinc-700/50 backdrop-blur-sm">
        <div className="p-4 space-y-4">
          {/* Top Row - Player Input and Core Settings */}
          <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6">
            {/* Left side - Player Input */}
            <div className="flex-grow flex items-center gap-4">
              <Input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder={isAddingCaptain ? "Enter captain name" : "Enter player name"}
                className="w-full bg-zinc-700 border-zinc-600 text-zinc-100 placeholder:text-zinc-400"
              />
              <CustomButton 
                type="submit" 
                onClick={onAddPlayer}
                disabled={!newName.trim() || addPlayerMutationPending}
                className="bg-blue-600 hover:bg-blue-700 text-white min-w-[120px] shrink-0 relative group"
                title={!userId ? "Please login to add players" : ""}
              >
                Add {isAddingCaptain ? 'Captain' : 'Player'}
                {!userId && (
                  <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-zinc-800 text-zinc-200 
                    px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                    Please login to add players
                  </span>
                )}
              </CustomButton>
            </div>

            <Separator.Root className="hidden lg:block bg-zinc-700 w-px h-8" orientation="vertical" />

            {/* Right side - Core Settings */}
            <div className="flex flex-wrap items-center gap-4 lg:gap-6 shrink-0">
              <div className="flex flex-wrap items-center gap-4">
                {/* Team Size Control */}
                <div className="flex items-center gap-2">
                  <Label.Root 
                    htmlFor="team-size" 
                    className="text-sm text-zinc-400 whitespace-nowrap"
                  >
                    Players per Team:
                  </Label.Root>
                  <Input
                    id="team-size"
                    type="number"
                    min={1}
                    max={4}
                    value={teamSize}
                    onChange={(e) => {
                      const newSize = parseInt(e.target.value, 10);
                      if (!isNaN(newSize) && newSize >= 1 && newSize <= 4) {
                        handleTeamSizeChange(newSize);
                      }
                    }}
                    className="w-16 bg-zinc-700 border-zinc-600 text-zinc-100"
                  />
                </div>

                {/* Number of Teams Control */}
                <div className="flex items-center gap-2">
                  <Label.Root 
                    htmlFor="num-teams" 
                    className="text-sm text-zinc-400 whitespace-nowrap"
                  >
                    Teams:
                  </Label.Root>
                  <Input
                    id="num-teams"
                    type="number"
                    value={numTeams}
                    onChange={(e) => handleUpdateNumTeams(parseInt(e.target.value, 10))}
                    className="w-16 bg-zinc-700 border-zinc-600 text-zinc-100"
                    min={1}
                  />
                </div>
              </div>

              <Separator.Root className="hidden lg:block bg-zinc-700 w-px h-8" orientation="vertical" />

              {/* Captain Toggle */}
              <div className="flex items-center gap-3">
                <Label.Root 
                  htmlFor="captain-mode" 
                  className="text-sm text-zinc-400 whitespace-nowrap"
                >
                  Add as Captain
                </Label.Root>
                <Switch.Root
                  id="captain-mode"
                  checked={isAddingCaptain}
                  onCheckedChange={setIsAddingCaptain}
                  className="w-[42px] h-[25px] bg-zinc-700 rounded-full relative data-[state=checked]:bg-blue-600 outline-none cursor-pointer shrink-0"
                >
                  <Switch.Thumb className="block w-[21px] h-[21px] bg-white rounded-full transition-transform duration-100 translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[19px]" />
                </Switch.Root>
              </div>
            </div>
          </div>

          <Separator.Root className="bg-zinc-700/50 h-px w-full" />

          {/* Bottom Row - Actions and Visual Settings */}
          <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
            {/* Left side - Population Controls */}
            <div className="flex flex-wrap items-center gap-2">
              <CustomButton
                onClick={handlePopulateCaptains}
                disabled={isCaptainsFull || !userId}
                className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed text-sm relative group"
                title={!userId ? "Please login to populate captains" : ""}
              >
                Populate Captains
                {!userId && (
                  <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-zinc-800 text-zinc-200 
                    px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50">
                    Please login to populate captains
                  </span>
                )}
              </CustomButton>

              <CustomButton
                onClick={handlePopulatePlayers}
                disabled={isPlayersFull || !userId}
                className="bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed text-sm relative group"
                title={!userId ? "Please login to populate players" : ""}
              >
                Populate Players
                {!userId && (
                  <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-zinc-800 text-zinc-200 
                    px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50">
                    Please login to populate players
                  </span>
                )}
              </CustomButton>

              <CustomButton
                onClick={handlePopulate}
                disabled={isAllPlayersFull || !userId}
                className="bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50 disabled:cursor-not-allowed text-sm relative group"
                title={!userId ? "Please login to populate all" : ""}
              >
                Populate All
                {!userId && (
                  <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-zinc-800 text-zinc-200 
                    px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50">
                    Please login to populate all
                  </span>
                )}
              </CustomButton>
            </div>

            {/* Center - Auto-Balance Controls */}
            <div className="flex flex-wrap items-center gap-2">
              <CustomButton
                onClick={handleAutoAssignCaptains}
                disabled={!hasCaptains || !userId || !activeBracketId}
                className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed text-sm relative group"
                title={!userId ? "Please login to auto-balance captains" : !activeBracketId ? "No active bracket selected" : !hasCaptains ? "No captains to balance" : ""}
              >
                Auto-Balance Captains
                {!userId && (
                  <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-zinc-800 text-zinc-200 
                    px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50">
                    Please login to auto-balance captains
                  </span>
                )}
              </CustomButton>

              <CustomButton
                onClick={handleAutoAssignPlayers}
                disabled={!hasPlayers || !userId || !activeBracketId}
                className="bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed text-sm relative group"
                title={!userId ? "Please login to auto-balance players" : !activeBracketId ? "No active bracket selected" : !hasPlayers ? "No players to balance" : ""}
              >
                Auto-Balance Players
                {!userId && (
                  <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-zinc-800 text-zinc-200 
                    px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50">
                    Please login to auto-balance players
                  </span>
                )}
              </CustomButton>

              <CustomButton
                onClick={handleAutoAssignAll}
                disabled={(!hasCaptains && !hasPlayers) || !userId || !activeBracketId}
                className="bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50 disabled:cursor-not-allowed text-sm relative group"
                title={!userId ? "Please login to auto-balance all" : !activeBracketId ? "No active bracket selected" : (!hasCaptains && !hasPlayers) ? "No players or captains to balance" : ""}
              >
                Auto-Balance All
                {!userId && (
                  <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-zinc-800 text-zinc-200 
                    px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50">
                    Please login to auto-balance all
                  </span>
                )}
              </CustomButton>
            </div>

            {/* Right side - Visual Settings */}
            <div className="flex flex-wrap items-center gap-4">
              {/* Settings Controls Group */}
              <div className="flex flex-wrap items-center gap-4">
                {/* Theme Selector */}
                <div className="flex items-center gap-2">
                  <Label.Root className="text-sm text-zinc-400">Themes:</Label.Root>
                  <Popover>
                    <PopoverTrigger asChild>
                      <CustomButton
                        id="theme-selector"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-zinc-400 hover:text-blue-400"
                      >
                        <Paintbrush className="h-4 w-4" />
                      </CustomButton>
                    </PopoverTrigger>
                    <PopoverContent 
                      className="p-2 bg-zinc-800 border border-zinc-700 shadow-lg shadow-black/50" 
                      align="end"
                      sideOffset={5}
                    >
                      <div className="grid gap-1.5">
                        {(Object.keys(colorThemes) as ThemePreset[]).map((themeName) => {
                          const theme = colorThemes[themeName];
                          const colors = theme.generateColors();
                          return (
                            <button
                              key={themeName}
                              onClick={() => setCurrentTheme(themeName)}
                              className={`flex items-center gap-2 p-2 rounded-md text-left
                                ${currentTheme === themeName ? 'bg-zinc-700 text-zinc-100' : 'text-zinc-300 hover:bg-zinc-700/50'}
                                transition-colors`}
                            >
                              <div 
                                className="w-4 h-4 rounded-full"
                                style={{ 
                                  background: colors.background,
                                  borderColor: colors.border,
                                  borderWidth: 1
                                }} 
                              />
                              <div className="flex flex-col">
                                <span className="text-sm font-medium">{theme.name}</span>
                                <span className="text-xs text-zinc-400">{theme.description}</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Toggles Group */}
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Label.Root htmlFor="show-ranks" className="text-sm text-zinc-400">Ranks:</Label.Root>
                    <Switch.Root
                      id="show-ranks"
                      checked={showRanks}
                      onCheckedChange={setShowRanks}
                      className="w-[42px] h-[25px] bg-zinc-700 rounded-full relative data-[state=checked]:bg-blue-600 outline-none cursor-pointer shrink-0"
                    >
                      <Switch.Thumb className="block w-[21px] h-[21px] bg-white rounded-full transition-transform duration-100 translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[19px]" />
                    </Switch.Root>
                  </div>

                  <div className="flex items-center gap-2">
                    <Label.Root htmlFor="team-logos" className="text-sm text-zinc-400">Logos:</Label.Root>
                    <Switch.Root
                      id="team-logos"
                      checked={showTeamLogos}
                      onCheckedChange={setShowTeamLogos}
                      className="w-[42px] h-[25px] bg-zinc-700 rounded-full relative data-[state=checked]:bg-blue-600 outline-none cursor-pointer shrink-0"
                    >
                      <Switch.Thumb className="block w-[21px] h-[21px] bg-white rounded-full transition-transform duration-100 translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[19px]" />
                    </Switch.Root>
                  </div>
                </div>
              </div>

              <Separator.Root className="hidden lg:block bg-zinc-700 w-px h-8" orientation="vertical" />

              <Dialog open={isClearDialogOpen} onOpenChange={setIsClearDialogOpen}>
                <DialogTrigger asChild>
                  <CustomButton
                    disabled={!userId}
                    className={cn(
                      buttonBaseStyles,
                      destructiveButtonStyles,
                      buttonContentStyles,
                      "text-sm relative group"
                    )}
                    title={!userId ? "Please login to clear lists" : ""}
                  >
                    <Trash2 className="h-4 w-4" />
                    Clear All Lists
                    {!userId && (
                      <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-zinc-800 text-zinc-200 
                        px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50">
                        Please login to clear lists
                      </span>
                    )}
                  </CustomButton>
                </DialogTrigger>
                <DialogContent className={dialogContentStyles}>
                  <DialogHeader>
                    <DialogTitle className={cn(dialogTitleStyles, "text-red-400")}>
                      Clear All Data
                    </DialogTitle>
                  </DialogHeader>
                  <div className="py-4 space-y-4">
                    <div className="flex items-start gap-3 text-zinc-300">
                      <div className="p-3 rounded-lg bg-blu-500/10 border border-red-500/20">
                        <Trash2 className="h-5 w-5 text-red-400" />
                      </div>
                      <div className="space-y-2">
                        <p className="font-medium text-red-400">
                          Are you sure you want to clear all data?
                        </p>
                        <ul className="space-y-2 text-sm text-zinc-400">
                          <li className="flex items-center gap-2">
                            <div className="w-1 h-1 rounded-full bg-red-400" />
                            Remove all players from the available pool
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-1 h-1 rounded-full bg-red-400" />
                            Remove all players from existing teams
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-1 h-1 rounded-full bg-red-400" />
                            Reset all team names to defaults
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-1 h-1 rounded-full bg-red-400" />
                            Clear all match scores and status
                          </li>
                        </ul>
                        <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                          <div className="flex items-center gap-2 text-amber-400">
                            <AlertTriangle className="h-4 w-4" />
                            <span className="text-sm font-medium">This action cannot be undone</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsClearDialogOpen(false)}
                      className={cn(buttonBaseStyles, myGamesButtonStyles)}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleClear}
                      disabled={!activeBracketId || clearBracketMutation.isPending}
                      className={cn(
                        buttonBaseStyles, 
                        destructiveButtonStyles,
                        "bg-red-500/10 hover:bg-red-500/20"
                      )}
                    >
                      {clearBracketMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Clear All Data
                        </>
                      )}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </Card>

      {/* Logo Management Section */}
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
                  {sortTeamsByNumber(teams).map((team) => (
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
    </div>
  );
};

export default SettingsSection; 