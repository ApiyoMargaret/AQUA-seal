import { Construction } from 'lucide-react';
import { EmptyState } from '@/components/shared/empty-state';

export default function BmuPage() {
  return (
    <EmptyState
      icon={Construction}
      title="BMU workspace coming next"
      description="Beach Management Unit tools — inspections, member rosters, and landing site logs — will be built here next."
    />
  );
}
