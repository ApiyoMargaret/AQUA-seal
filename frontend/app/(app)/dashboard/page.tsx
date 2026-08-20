import { Construction } from 'lucide-react';
import { EmptyState } from '@/components/shared/empty-state';

export default function DashboardPage() {
  return (
    <EmptyState
      icon={Construction}
      title="Dashboard coming next"
      description="Batch overview, freshness summaries, and verification queues will appear here in the next build pass."
    />
  );
}
