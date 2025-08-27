'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { Users, DollarSign, Clock, Star } from 'lucide-react'

interface TeamStats {
  totalWorkers: number
  activeWorkers: number
  totalEarned: number
  totalPaid: number
  pendingPayments: number
  averageRate: number
}

export function TeamOverview() {
  const [stats, setStats] = useState<TeamStats>({
    totalWorkers: 0,
    activeWorkers: 0,
    totalEarned: 0,
    totalPaid: 0,
    pendingPayments: 0,
    averageRate: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/workers/stats')
        if (response.ok) {
          const data = await response.json()
          setStats(data)
        }
      } catch (error) {
        console.error('Failed to fetch team stats:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  const statCards = [
    {
      title: 'Total Team Members',
      value: stats.totalWorkers.toString(),
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      description: `${stats.activeWorkers} active`
    },
    {
      title: 'Total Earned',
      value: formatCurrency(stats.totalEarned),
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      description: 'By team members'
    },
    {
      title: 'Pending Payments',
      value: formatCurrency(stats.pendingPayments),
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      description: 'Owe to workers'
    },
    {
      title: 'Average Rate',
      value: stats.averageRate > 0 ? formatCurrency(stats.averageRate) + '/hr' : 'N/A',
      icon: Star,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      description: 'Hourly rate'
    },
  ]

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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