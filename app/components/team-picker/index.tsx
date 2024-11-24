import { useState, useEffect } from 'react';
import { SaveLoadSection } from './save-load-section';
import { toast } from '@/utils/toast';
import type { Player, Captain, ThemePreset, PickerMode } from '@/types/team-picker';
import type { SavedBracket } from './types';

export function TeamPicker() {
  // Your existing state
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Captain[]>([]);
  const [numTeams, setNumTeams] = useState(2);
  const [teamSize, setTeamSize] = useState(5);
  const [showRanks, setShowRanks] = useState(true);
  const [showTeamLogos, setShowTeamLogos] = useState(true);
  const [currentTheme, setCurrentTheme] = useState<ThemePreset>('default');
  const [currentMode, setCurrentMode] = useState<PickerMode>('draft');
  const [activeBracketId, setActiveBracketId] = useState<string | null>(null);

  // Add this handler to load tournament data
  const handleLoadBracket = (data: SavedBracket['data']) => {
    console.log('Parent received bracket data:', data);
    
    try {
      // Update players
      if (Array.isArray(data.players)) {
        console.log('Setting players:', data.players);
        setPlayers(data.players);
      }
      
      // Update teams
      if (Array.isArray(data.teams)) {
        console.log('Setting teams:', data.teams);
        setTeams(data.teams);
      }
      
      // Update settings
      const { settings } = data;
      if (settings) {
        console.log('Setting settings:', settings);
        setNumTeams(settings.numTeams);
        setTeamSize(settings.teamSize);
        setShowRanks(settings.showRanks);
        setShowTeamLogos(settings.showTeamLogos);
        setCurrentTheme(settings.currentTheme);
        setCurrentMode(settings.mode);
      }

      console.log('State update complete');
    } catch (error) {
      console.error('Error updating state:', error);
      toast.error({
        title: 'Error',
        description: 'Failed to load tournament data'
      });
    }
  };

  // Add this handler to update the active bracket
  const handleBracketSelect = (id: string | null) => {
    console.log('Setting active bracket:', id);
    if (id) {
      setActiveBracketId(id);
    }
  };

  return (
    <div>
      {/* Your other components */}
      
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
        activeBracketId={activeBracketId}
        onBracketSelect={handleBracketSelect}
      />
      
      {/* Display players and teams for debugging */}
      <div className="mt-4">
        <h3>Players ({players.length})</h3>
        <pre className="text-xs">{JSON.stringify(players, null, 2)}</pre>
        
        <h3>Teams ({teams.length})</h3>
        <pre className="text-xs">{JSON.stringify(teams, null, 2)}</pre>
      </div>
    </div>
  );
} 