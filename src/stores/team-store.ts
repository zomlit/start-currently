import { create } from 'zustand'

interface Player {
  id: string
  name: string
}

interface TeamStore {
  players: Player[]
  captains: Player[]
  addPlayer: (player: Player) => void
  addCaptain: (captain: Player) => void
  removePlayer: (id: string) => void
  removeCaptain: (id: string) => void
}

export const useTeamStore = create<TeamStore>((set) => ({
  players: [],
  captains: [],
  addPlayer: (player) => 
    set((state) => ({ players: [...state.players, player] })),
  addCaptain: (captain) => 
    set((state) => ({ captains: [...state.captains, captain] })),
  removePlayer: (id) => 
    set((state) => ({ players: state.players.filter(p => p.id !== id) })),
  removeCaptain: (id) => 
    set((state) => ({ captains: state.captains.filter(c => c.id !== id) })),
})) 