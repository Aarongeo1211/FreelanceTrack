'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatDate, formatCurrency } from '@/lib/utils'
import Link from 'next/link'
import { FolderOpen, Calendar, DollarSign, User } from 'lucide-react'

interface Project {
  id: string
  name: string
  description?: string
  status: string
  budget?: number
  hourlyRate?: number
  totalCost: number
  paidAmount: number
  startDate?: string
  endDate?: string
  createdAt: string
  client: {
    id: string
    name: string
    email?: string
    company?: string
  }
  _count: {
    tasks: number
    payments: number
  }
}

export function ProjectsTable() {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('/api/projects')
        if (response.ok) {
          const data = await response.json()
          setProjects(data)
        }
      } catch (error) {
        console.error('Failed to fetch projects:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProjects()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800'
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800'
      case 'ON_HOLD':
        return 'bg-yellow-100 text-yellow-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-6">
        {projects.length === 0 ? (
          <div className="text-center py-12">
            <FolderOpen className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No projects found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating your first project.
            </p>
            <div className="mt-6">
              <Link href="/dashboard/projects/new">
                <Button>Create your first project</Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {projects.map((project) => (
              <div key={project.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-medium text-gray-900">{project.name}</h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                        {project.status.replace('_', ' ')}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-1" />
                        {project.client.name}
                      </div>
                      {project.budget && (
                        <div className="flex items-center">
                          <DollarSign className="w-4 h-4 mr-1" />
                          Budget: {formatCurrency(project.budget)}
                        </div>
                      )}
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        Created {formatDate(project.createdAt)}
                      </div>
                    </div>

                    {project.description && (
                      <p className="text-sm text-gray-600 mb-2">{project.description}</p>
                    )}

                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>{project._count.tasks} task{project._count.tasks !== 1 ? 's' : ''}</span>
                      <span>{project._count.payments} payment{project._count.payments !== 1 ? 's' : ''}</span>
                      <span>Total: {formatCurrency(project.totalCost)}</span>
                      <span>Paid: {formatCurrency(project.paidAmount)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}