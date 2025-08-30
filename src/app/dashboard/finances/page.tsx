'use client'

import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { FinanceOverview } from '@/components/finances/finance-overview'
import { PaymentsTable } from '@/components/finances/payments-table'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus } from 'lucide-react'

export default function FinancesPage() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return <div>Loading...</div>; // Or a proper loading skeleton
  }

  if (!session) {
    redirect('/auth/signin');
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Finances</h1>
            <p className="mt-2 text-gray-600">
              Track your income, expenses, and payment status.
            </p>
          </div>
          <Link href="/dashboard/finances/payments/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Record Payment
            </Button>
          </Link>
        </div>

        <FinanceOverview />
        <PaymentsTable />
      </div>
    </DashboardLayout>
  )
}