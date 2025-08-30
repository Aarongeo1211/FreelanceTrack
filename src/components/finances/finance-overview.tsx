'use client'

import { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { DollarSign, TrendingUp, TrendingDown, Clock, CheckCircle, AlertCircle } from 'lucide-react'

interface FinanceStats {
  totalIncoming: number
  totalOutgoing: number
  pendingIncoming: number
  pendingOutgoing: number
  paidIncoming: number
  paidOutgoing: number
  overduePayments: number
  netProfit: number
}

export function FinanceOverview() {
  const [stats, setStats] = useState<FinanceStats>({
    totalIncoming: 0,
    totalOutgoing: 0,
    pendingIncoming: 0,
    pendingOutgoing: 0,
    paidIncoming: 0,
    paidOutgoing: 0,
    overduePayments: 0,
    netProfit: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  const fetchStats = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/payments/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Failed to fetch finance stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  // Listen for custom refresh events
  useEffect(() => {
    const handleRefresh = () => {
      fetchStats()
    }

    window.addEventListener('refreshPayments', handleRefresh)
    return () => {
      window.removeEventListener('refreshPayments', handleRefresh)
    }
  }, [])

  const statCards = [
    {
      title: 'Total Revenue',
      value: formatCurrency(stats.paidIncoming),
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      description: 'Payments received'
    },
    {
      title: 'Pending Income',
      value: formatCurrency(stats.pendingIncoming),
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      description: 'Awaiting payment'
    },
    {
      title: 'Total Expenses',
      value: formatCurrency(stats.paidOutgoing),
      icon: TrendingDown,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      description: 'Payments made'
    },
    {
      title: 'Net Profit',
      value: formatCurrency(stats.netProfit),
      icon: TrendingUp,
      color: stats.netProfit >= 0 ? 'text-green-600' : 'text-red-600',
      bgColor: stats.netProfit >= 0 ? 'bg-green-100' : 'bg-red-100',
      description: 'Revenue minus expenses'
    },
    {
      title: 'Pending Payments',
      value: formatCurrency(stats.pendingOutgoing),
      icon: AlertCircle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      description: 'Owe to workers'
    },
    {
      title: 'Overdue',
      value: stats.overduePayments.toString(),
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      description: 'Overdue payments'
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