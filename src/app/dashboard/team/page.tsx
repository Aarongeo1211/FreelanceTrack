import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { TeamOverview } from '@/components/team/team-overview'
import { WorkersTable } from '@/components/team/workers-table'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus } from 'lucide-react'

export default async function TeamPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/signin')
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Team</h1>
            <p className="mt-2 text-gray-600">
              Manage your team members, subcontractors, and their payments.
            </p>
          </div>
          <Link href="/dashboard/team/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Team Member
            </Button>
          </Link>
        </div>

        <TeamOverview />
        <WorkersTable />
      </div>
    </DashboardLayout>
  )
}