import * as React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import TeamPickerV2 from '../components/TeamPickerV2';
import { useAuth } from '@clerk/tanstack-start';
import { useBrackets } from '@/lib/team-picker/hooks';

export const Route = createFileRoute('/tournament')({
  component: TournamentPage,
});

function TournamentPage() {
  const { userId } = useAuth();
  const { data: brackets } = useBrackets(userId);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Tournament Brackets</h1>
      <TeamPickerV2 initialState={brackets?.[0]} />
    </div>
  );
} 