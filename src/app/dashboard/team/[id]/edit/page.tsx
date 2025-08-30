'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { WorkerForm } from '@/components/team/worker-form'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function EditTeamMemberPage() {
  const params = useParams()
  const [worker, setWorker] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchWorker = async () => {
      try {
        const response = await fetch(`/api/workers/${params.id}`)
        if (response.ok) {
          const data = await response.json()
          setWorker(data)
        } else {
          setError('Team member not found')
        }
      } catch (error) {
        console.error('Failed to fetch worker:', error)
        setError('Failed to load team member')
      } finally {
        setIsLoading(false)
      }
    }

    if (params.id) {
      fetchWorker()
    }
  }, [params.id])

  if (isLoading) {
    return (
      <DashboardLayout>
        <Card className="max-w-2xl">
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </CardContent>
        </Card>
      </DashboardLayout>
    )
  }

  if (error) {
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
          <Card className="max-w-2xl">
            <CardContent className="p-6">
              <div className="text-center py-8">
                <div className="text-red-600 mb-4">{error}</div>
                <Link 
                  href="/dashboard/team"
                  className="text-blue-600 hover:text-blue-800"
                >
                  Go Back to Team
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
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
          <h1 className="text-3xl font-bold text-gray-900">Edit Team Member</h1>
          <p className="mt-2 text-gray-600">
            Update team member information and settings.
          </p>
        </div>

        <WorkerForm worker={worker} isEditing={true} />
      </div>
    </DashboardLayout>
  )
}