import { supabase } from "@/utils/supabase/client";
import type { Captain, Player, PickerMode, ThemePreset } from "../../types/team-picker";
import type { QueryClient } from "@tanstack/react-query";
import type { Database } from "../../types/supabase";

export const bracketOperations = {
  autoSave: async (bracketId: string, data: {
    teams?: Captain[];
    players?: Player[];
    settings?: {
      numTeams?: number;
      teamSize?: number;
      showRanks?: boolean;
      showTeamLogos?: boolean;
      currentTheme?: ThemePreset;
      mode?: PickerMode;
    };
  }) => {
    const { error } = await supabase
      .from('Bracket')
      .update({
        data,
        updated_at: new Date().toISOString()
      })
      .eq('id', bracketId);

    if (error) throw error;
  }
};

export const dragDropOperations = {
  handleDragDrop: async ({
    source,
    destination,
    teams,
    players,
    teamSize,
    activeBracketId,
    settings
  }: {
    source: { droppableId: string; index: number };
    destination: { droppableId: string; index: number };
    teams: Captain[];
    players: Player[];
    teamSize: number;
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
    // Create new references for state updates
    const newTeams = [...teams];
    const newPlayers = [...players];

    // Get the moved player
    let movedPlayer: Player | undefined;
    
    if (source.droppableId === 'players') {
      movedPlayer = players[source.index];
    } else if (source.droppableId === 'captains') {
      movedPlayer = players.find(p => p.isCaptain);
    } else {
      const teamId = source.droppableId.replace('team-', '');
      const sourceTeam = teams.find(t => t.id === teamId);
      movedPlayer = sourceTeam?.players[source.index];
    }

    if (!movedPlayer) {
      console.error('Could not find moved player', {
        source,
        teams,
        players,
        movedPlayer
      });
      return { newTeams, newPlayers };
    }

    // Handle moving from players/captains list to team
    if ((source.droppableId === 'players' || source.droppableId === 'captains') && 
        destination.droppableId.startsWith('team-')) {
      const teamId = destination.droppableId.replace('team-', '');
      const targetTeam = newTeams.find(t => t.id === teamId);
      
      if (targetTeam) {
        const playerIndex = newPlayers.findIndex(p => p.id === movedPlayer!.id);
        if (playerIndex !== -1) {
          newPlayers.splice(playerIndex, 1);
        }
        targetTeam.players.splice(destination.index, 0, movedPlayer);
      }
    }
    // Handle moving from team to players/captains list
    else if (source.droppableId.startsWith('team-') && 
             (destination.droppableId === 'players' || destination.droppableId === 'captains')) {
      const teamId = source.droppableId.replace('team-', '');
      const sourceTeam = newTeams.find(t => t.id === teamId);
      
      if (sourceTeam) {
        sourceTeam.players.splice(source.index, 1);
        newPlayers.splice(destination.index, 0, movedPlayer);
      }
    }
    // Handle moving between teams
    else if (source.droppableId.startsWith('team-') && destination.droppableId.startsWith('team-')) {
      const sourceTeamId = source.droppableId.replace('team-', '');
      const destTeamId = destination.droppableId.replace('team-', '');
      
      const sourceTeam = newTeams.find(t => t.id === sourceTeamId);
      const destTeam = newTeams.find(t => t.id === destTeamId);
      
      if (sourceTeam && destTeam) {
        sourceTeam.players.splice(source.index, 1);
        destTeam.players.splice(destination.index, 0, movedPlayer);
      }
    }

    // Save changes
    try {
      if (activeBracketId) {
        await bracketOperations.autoSave(activeBracketId, {
          teams: newTeams,
          players: newPlayers,
          settings
        });
      }
    } catch (error) {
      console.error('Failed to save changes:', error);
      throw error;
    }

    return { newTeams, newPlayers };
  },

  handleRemoveFromTeam: async ({
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
    console.log('🎯 Remove button clicked:', { 
      playerId, 
      teamId, 
      activeBracketId,
      player: players.find(p => p.id === playerId),
      team: teams.find(t => t.id === teamId)
    });

    console.log('Starting remove operation:', { playerId, teamId, activeBracketId });
    
    const newTeams = [...teams];
    const newPlayers = [...players];

    // Find the team and player
    const team = newTeams.find(t => t.id === teamId);
    const playerIndex = team?.players.findIndex(p => p.id === playerId) ?? -1;
    
    console.log('Found team and player:', { team, playerIndex });

    if (team && playerIndex !== -1) {
      // Remove player from team
      const [removedPlayer] = team.players.splice(playerIndex, 1);
      console.log('Removed player:', removedPlayer);
      
      // Add back to appropriate list
      if (removedPlayer.isCaptain) {
        const captainIndex = newPlayers.findIndex(p => p.isCaptain);
        if (captainIndex !== -1) {
          newPlayers.splice(captainIndex, 0, removedPlayer);
        } else {
          newPlayers.unshift(removedPlayer);
        }
        console.log('Added captain back to list at index:', captainIndex);
      } else {
        newPlayers.push(removedPlayer);
        console.log('Added player back to list');
      }

      // Save changes
      try {
        if (activeBracketId) {
          console.log('Saving to database:', {
            teams: newTeams,
            players: newPlayers,
            settings
          });

          // First verify current state
          const { data: currentData } = await supabase
            .from('Bracket')
            .select('data')
            .eq('id', activeBracketId)
            .single();
          
          console.log('Current database state:', currentData);

          // Then update
          const { error } = await supabase
            .from('Bracket')
            .update({
              data: {
                teams: newTeams,
                players: newPlayers,
                settings
              },
              updated_at: new Date().toISOString()
            })
            .eq('id', activeBracketId);

          if (error) {
            console.error('Failed to save changes to database:', error);
            throw error;
          }

          // Verify update
          const { data: updatedData } = await supabase
            .from('Bracket')
            .select('data')
            .eq('id', activeBracketId)
            .single();
          
          console.log('Updated database state:', updatedData);
        }
      } catch (error) {
        console.error('Failed to save changes:', error);
        throw error;
      }
    }

    return { newTeams, newPlayers };
  }
};

export const mutationOperations = {
  updateTeams: {
    mutate: async (teams: Captain[], bracketId: string) => {
      const { error } = await supabase
        .from('Bracket')
        .update({ 
          data: { teams },
          updated_at: new Date().toISOString()
        })
        .eq('id', bracketId);
      
      if (error) throw error;
      return teams;
    },
    onSuccess: (teams: Captain[], queryClient: QueryClient) => {
      queryClient.setQueryData(['currentBracket'], (old: any) => ({
        ...old,
        data: { ...old.data, teams }
      }));
    }
  },

  addPlayer: {
    mutate: async (player: Player, userId: string, bracketId: string) => {
      const { data: bracketData, error } = await supabase
        .from('Bracket')
        .select('data')
        .eq('id', bracketId)
        .single();

      if (error) throw error;

      const players = [...(bracketData?.data?.players || []), player];
      
      const { error: updateError } = await supabase
        .from('Bracket')
        .update({ 
          data: { ...bracketData?.data, players },
          updated_at: new Date().toISOString()
        })
        .eq('id', bracketId);

      if (updateError) throw updateError;
      return { player, players };
    },
    onSuccess: (result: { player: Player; players: Player[] }, queryClient: QueryClient) => {
      queryClient.setQueryData(['currentBracket'], (old: any) => ({
        ...old,
        data: { ...old.data, players: result.players }
      }));
    }
  },

  updatePlayerRank: {
    mutate: async ({ playerId, newRank, RANK_IMAGES }: { 
      playerId: string; 
      newRank: string;
      RANK_IMAGES: Record<string, string>;
    }) => {
      // Implementation here
      return { playerId, newRank, iconUrl: RANK_IMAGES[newRank] };
    }
  },

  autoAssignCaptains: {
    mutate: async ({ bracketId, captains, teams }: {
      bracketId: string;
      captains: Player[];
      teams: Captain[];
    }) => {
      // Implementation here
      return { teams, captains };
    },
    onSuccess: (result: { teams: Captain[]; captains: Player[] }, queryClient: QueryClient) => {
      queryClient.setQueryData(['currentBracket'], (old: any) => ({
        ...old,
        data: { 
          ...old.data, 
          teams: result.teams,
          players: result.captains
        }
      }));
    }
  },

  autoAssignPlayers: {
    mutate: async ({ bracketId, players, teams }: {
      bracketId: string;
      players: Player[];
      teams: Captain[];
    }) => {
      // Implementation here
      return { teams, players };
    },
    onSuccess: (result: { teams: Captain[]; players: Player[] }, queryClient: QueryClient) => {
      queryClient.setQueryData(['currentBracket'], (old: any) => ({
        ...old,
        data: { 
          ...old.data, 
          teams: result.teams,
          players: result.players
        }
      }));
    }
  },

  clearBracket: {
    mutate: async ({ bracketId, emptyTeams, settings }: {
      bracketId: string;
      emptyTeams: Captain[];
      settings: {
        numTeams: number;
        teamSize: number;
        showRanks: boolean;
        showTeamLogos: boolean;
        currentTheme: ThemePreset;
        mode: PickerMode;
      };
    }) => {
      const { error } = await supabase
        .from('Bracket')
        .update({
          data: {
            teams: emptyTeams,
            players: [],
            settings
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', bracketId);

      if (error) throw error;
      return { teams: emptyTeams, players: [] };
    },
    onSuccess: (result: { teams: Captain[]; players: Player[] }, queryClient: QueryClient) => {
      queryClient.setQueryData(['currentBracket'], (old: any) => ({
        ...old,
        data: { 
          ...old.data, 
          teams: result.teams,
          players: result.players
        }
      }));
    }
  },

  updateBracketData: {
    mutate: async ({ bracketId, bracketData }: {
      bracketId: string | undefined;
      bracketData: any;
    }) => {
      if (!bracketId) throw new Error('No bracket ID');
      
      const { error } = await supabase
        .from('Bracket')
        .update({ 
          bracket_data: bracketData,
          updated_at: new Date().toISOString()
        })
        .eq('id', bracketId);

      if (error) throw error;
      return bracketData;
    },
    onSuccess: (data: any, queryClient: QueryClient) => {
      queryClient.setQueryData(['currentBracket'], (old: any) => ({
        ...old,
        bracket_data: data
      }));
    }
  }
};

export const tournamentOperations = {
  generateBrackets: async (bracketId: string, teams: Captain[], numTeams: number) => {
    // Implementation here
    return { /* bracket data */ };
  },

  duplicateBracket: async (bracketId: string, newName: string, userId: string) => {
    // Implementation here
    return { /* new bracket data */ };
  },

  getBracket: async (bracketId: string) => {
    const { data, error } = await supabase
      .from('Bracket')
      .select('*')
      .eq('id', bracketId)
      .single();

    if (error) throw error;
    return data;
  }
}; 