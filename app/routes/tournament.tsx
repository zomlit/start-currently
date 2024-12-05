import * as React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import TeamPickerV2 from '../components/TeamPickerV2';
import { useQuery } from '@tanstack/react-query';
import { tournamentOperations } from '@/lib/team-picker/operations';
import { useAuth } from '@clerk/tanstack-start';

export const Route = createFileRoute('/tournament')({
  component: TournamentPage,
});

function TournamentPage() {
  const { userId } = useAuth();

  // Get current bracket data
  const { data: brackets } = useQuery({
    queryKey: ['brackets', userId],
    queryFn: async () => {
      if (!userId) return [];
      const brackets = await tournamentOperations.getBrackets(userId);
      console.log('Loaded brackets:', brackets);
      return brackets;
    },
    enabled: !!userId,
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Tournament Brackets</h1>
      <TeamPickerV2 initialState={brackets?.[0]?.data} />
    </div>
  );
} 