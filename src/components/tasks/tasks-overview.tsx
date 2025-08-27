'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { CheckSquare, Clock, AlertCircle, TrendingUp } from 'lucide-react'

interface TaskStats {
  totalTasks: number
  completedTasks: number
  pendingTasks: number
  overdueTasks: number
  totalValue: number
  completedValue: number
}

export function TasksOverview() {
  const [stats, setStats] = useState<TaskStats>({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    overdueTasks: 0,
    totalValue: 0,
    completedValue: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/tasks/stats')
        if (response.ok) {
          const data = await response.json()
          setStats(data)
        }
      } catch (error) {
        console.error('Failed to fetch task stats:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  const statCards = [
    {
      title: 'Total Tasks',
      value: stats.totalTasks.toString(),
      icon: CheckSquare,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      description: 'All tasks'
    },
    {
      title: 'Completed',
      value: stats.completedTasks.toString(),
      icon: CheckSquare,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      description: 'Finished tasks'
    },
    {
      title: 'In Progress',
      value: stats.pendingTasks.toString(),
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      description: 'Active tasks'
    },
    {
      title: 'Overdue',
      value: stats.overdueTasks.toString(),
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      description: 'Past due date'
    },
    {
      title: 'Total Value',
      value: formatCurrency(stats.totalValue),
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      description: 'All task value'
    },
    {
      title: 'Completed Value',
      value: formatCurrency(stats.completedValue),
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      description: 'Earned amount'
    },
  ]

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-gray-200 w-12 h-12"></div>
                <div className="ml-4 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {statCards.map((stat, index) => {
        const Icon = stat.icon
        return (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-8 w-8 ${stat.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}