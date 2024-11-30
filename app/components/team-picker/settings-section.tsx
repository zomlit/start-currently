import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import * as Switch from '@radix-ui/react-switch';
import * as Label from '@radix-ui/react-label';
import * as Separator from '@radix-ui/react-separator';
import { CustomButton } from '@/components/ui/custom-button';
import { Paintbrush, ImageIcon, X, ChevronDown, Trash2 } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { colorThemes } from '../../utils/colorThemes';
import type { ThemePreset } from '@/types/team-picker';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { Captain } from '@/types/team-picker';
import { toast } from 'sonner';

interface SettingsSectionProps {
  newName: string;
  setNewName: (name: string) => void;
  isAddingCaptain: boolean;
  setIsAddingCaptain: (value: boolean) => void;
  teamSize: number;
  handleTeamSizeChange: (size: number) => void;
  numTeams: number;
  handleUpdateNumTeams: (num: number) => void;
  handleAddPlayer: (e: React.FormEvent) => void;
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
  handleClearAll: () => void;
  teams: Captain[];
  getTeamNumber: (teamIndex: number, totalTeams: number) => string;
  showRanks: boolean;
  setShowRanks: (show: boolean) => void;
  userId: string;
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
  handleAddPlayer,
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
  handleClearAll,
  teams,
  getTeamNumber,
  showRanks,
  setShowRanks,
  userId,
}) => {
  const [isClearDialogOpen, setIsClearDialogOpen] = useState(false);

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
                onClick={handleAddPlayer}
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
                onClick={autoAssignCaptains}
                disabled={!hasCaptains || !userId}
                className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed text-sm relative group"
                title={!userId ? "Please login to auto-balance captains" : !hasCaptains ? "No captains to balance" : ""}
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
                onClick={autoAssignPlayers}
                disabled={!hasPlayers || !userId}
                className="bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed text-sm relative group"
                title={!userId ? "Please login to auto-balance players" : !hasPlayers ? "No players to balance" : ""}
              >
                Auto-Balance Players
                {!userId && (
                  <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-zinc-800 text-zinc-200 
                    px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50">
                    Please login to auto-balance players
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
                    className="bg-red-600 hover:bg-red-700 text-white text-sm relative group"
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
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-red-500">
                      <Trash2 className="h-5 w-5" />
                      Clear All Data
                    </DialogTitle>
                    <DialogDescription className="space-y-3 pt-3">
                      <p>
                        You're about to clear all data from the team picker. This will:
                      </p>
                      <ul className="list-disc pl-4 space-y-1 text-sm">
                        <li>Remove all players from the available pool</li>
                        <li>Remove all players from existing teams</li>
                        <li>Reset all team names to defaults</li>
                        <li>Clear all match scores and status</li>
                      </ul>
                      <div className="bg-amber-500/10 border border-amber-500/20 rounded-md p-3 text-amber-500 text-sm mt-4">
                        ⚠️ This action cannot be undone. Please make sure you want to proceed.
                      </div>
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                      variant="outline"
                      onClick={() => setIsClearDialogOpen(false)}
                      className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700 hover:border-zinc-600 text-zinc-100"
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        handleClearAll();
                        setIsClearDialogOpen(false);
                      }}
                      className="gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Clear All Data
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </Card>

      {/* Logo Management Section */}
      <div 
        className={`
          transition-all duration-300 ease-in-out overflow-hidden
          ${showTeamLogos 
            ? 'max-h-[1000px] opacity-100 transform translate-y-0' 
            : 'max-h-0 opacity-0 transform -translate-y-4'
          }
        `}
      >
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

          <div
            className={`transition-all duration-300 ease-in-out
              ${isLogoSectionCollapsed 
                ? 'max-h-0 opacity-0 transform translate-y-2' 
                : 'max-h-[1000px] opacity-100 transform translate-y-0'
              }`}
          >
            <div className="p-4 space-y-4">
              {/* Team Logo Grid */}
              <div className="grid grid-cols-4 gap-4">
                {teams.map((team, index) => (
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
                          Team {getTeamNumber(index, teams.length)}
                        </span>
                        <span className="text-sm text-zinc-400 truncate">
                          {team.name}
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
    </div>
  );
};

export default SettingsSection; 