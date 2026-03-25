'use client';

import { useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { IndividualAnalytics } from '@/components/analytics/IndividualAnalytics';
import { EmptyState } from '@/components/shared';
import { ShieldAlert } from 'lucide-react';

export default function MemberAnalyticsPage() {
  const params = useParams();
  const { user } = useAuth();
  const memberId = params.id as string;

  // Access Control: Only admins can see OTHERS. Members can see ONLY themselves.
  const isSelf = user?.id === memberId;
  const isAdmin = user?.role === 'admin';
  const hasAccess = isAdmin || isSelf;

  if (!hasAccess) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <EmptyState 
          icon={<ShieldAlert className="w-16 h-16 text-rose-500/50" />} 
          title="Access Restricted" 
          description="You do not have permission to view this member's individual analytics." 
        />
      </div>
    );
  }

  return (
    <div className="p-8">
      <IndividualAnalytics memberId={memberId} isAdminView={isAdmin} />
    </div>
  );
}
