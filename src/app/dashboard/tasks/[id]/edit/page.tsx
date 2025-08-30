'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { TaskForm } from '@/components/tasks/task-form'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { Card, CardContent } from '@/components/ui/card'

export default function EditTaskPage() {
  const params = useParams()
  const [task, setTask] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const response = await fetch(`/api/tasks/${params.id}`)
        if (response.ok) {
          const data = await response.json()
          setTask(data)
        } else {
          setError('Task not found')
        }
      } catch (error) {
        console.error('Failed to fetch task:', error)
        setError('Failed to load task')
      } finally {
        setIsLoading(false)
      }
    }

    if (params.id) {
      fetchTask()
    }
  }, [params.id])

  if (isLoading) {
    return (
      <DashboardLayout>
        <Card>
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
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-8">
              <div className="text-red-600 mb-4">{error}</div>
              <button 
                onClick={() => window.history.back()}
                className="text-blue-600 hover:text-blue-800"
              >
                Go Back
              </button>
            </div>
          </CardContent>
        </Card>
      </DashboardLayout>
    )
  }

  return <TaskForm task={task} isEditing={true} />
}