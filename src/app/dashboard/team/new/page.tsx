import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { WorkerForm } from '@/components/team/worker-form'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function NewTeamMemberPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/signin')
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Link
            href="/dashboard/team"
            className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to team
          </Link>
        </div>

        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add Team Member</h1>
          <p className="mt-2 text-gray-600">
            Add a new team member or subcontractor to your workforce.
          </p>
        </div>

        <WorkerForm />
      </div>
    </DashboardLayout>
  )
}