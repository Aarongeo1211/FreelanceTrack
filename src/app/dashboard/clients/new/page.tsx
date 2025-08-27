import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { ClientForm } from '@/components/clients/client-form'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function NewClientPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/signin')
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Link
            href="/dashboard/clients"
            className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to clients
          </Link>
        </div>

        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add New Client</h1>
          <p className="mt-2 text-gray-600">
            Create a new client profile to start managing projects and payments.
          </p>
        </div>

        <ClientForm />
      </div>
    </DashboardLayout>
  )
}