'use client'

import { useEffect } from 'react'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { DashboardStats } from '@/components/dashboard/dashboard-stats'
import { RecentActivity } from '@/components/dashboard/recent-activity'
import { QuickActions } from '@/components/dashboard/quick-actions'
import { FinancialChart } from '@/components/dashboard/financial-chart'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'

export default function DashboardPage() {
  const { data: session, status } = useSession()

  useEffect(() => {
    const updatePaymentStatus = async () => {
      try {
        await fetch('/api/payments/update-status', { method: 'POST' });
      } catch (error) {
        console.error('Failed to update payment statuses:', error);
      }
    };

    updatePaymentStatus();
  }, []);

  if (status === 'loading') {
    return <div>Loading...</div>; // Or a proper loading skeleton
  }

  if (!session) {
    redirect('/auth/signin');
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {session.user?.name}!
          </h1>
          <p className="mt-2 text-gray-600">
            Here's what's happening with your freelance business today.
          </p>
        </div>

        <DashboardStats />
        
        <FinancialChart />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RecentActivity />
          </div>
          <div>
            <QuickActions />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}