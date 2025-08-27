'use client'

import { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { ChartJS } from '@/lib/chart-config'
import { Chart } from 'react-chartjs-2'

interface ChartDataPoint {
  month: string
  revenue: number
  expenses: number
  profit: number
}

export function FinancialChart() {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [chartReady, setChartReady] = useState(false)

  useEffect(() => {
    // Ensure Chart.js is ready
    const initChart = async () => {
      try {
        await import('@/lib/chart-config')
        setChartReady(true)
      } catch (error) {
        console.error('Failed to initialize Chart.js:', error)
      }
    }
    
    initChart()
  }, [])

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const response = await fetch('/api/dashboard/chart')
        if (response.ok) {
          const data = await response.json()
          setChartData(data)
        }
      } catch (error) {
        console.error('Failed to fetch chart data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (chartReady) {
      fetchChartData()
    }
  }, [chartReady])

  if (isLoading || !chartReady) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Financial Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 bg-gray-100 rounded-md animate-pulse flex items-center justify-center">
            <span className="text-gray-500">Loading chart...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.dataset.label || ''
            const value = context.parsed.y
            return `${label}: ${formatCurrency(value)}`
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return formatCurrency(value)
          }
        }
      }
    },
  }

  const data = {
    labels: chartData.map(item => item.month),
    datasets: [
      {
        type: 'bar' as const,
        label: 'Revenue',
        data: chartData.map(item => item.revenue),
        backgroundColor: 'rgba(34, 197, 94, 0.5)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 1,
      },
      {
        type: 'bar' as const,
        label: 'Expenses',
        data: chartData.map(item => item.expenses),
        backgroundColor: 'rgba(239, 68, 68, 0.5)',
        borderColor: 'rgba(239, 68, 68, 1)',
        borderWidth: 1,
      },
      {
        type: 'line' as const,
        label: 'Net Profit',
        data: chartData.map(item => item.profit),
        borderColor: 'rgba(59, 130, 246, 1)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 3,
        pointRadius: 5,
        pointBackgroundColor: 'rgba(59, 130, 246, 1)',
        fill: false,
      },
    ],
  }

  const totalRevenue = chartData.reduce((sum, item) => sum + item.revenue, 0)
  const totalExpenses = chartData.reduce((sum, item) => sum + item.expenses, 0)
  const netProfit = totalRevenue - totalExpenses

  return (
    <Card>
      <CardHeader>
        <CardTitle>Financial Overview - Last 6 Months</CardTitle>
        <div className="flex space-x-6 text-sm">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
            <span>Total Revenue: {formatCurrency(totalRevenue)}</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded mr-2"></div>
            <span>Total Expenses: {formatCurrency(totalExpenses)}</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
            <span className={netProfit >= 0 ? 'text-green-600' : 'text-red-600'}>
              Net Profit: {formatCurrency(netProfit)}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <Chart type="bar" data={data} options={options} />
        </div>
      </CardContent>
    </Card>
  )
}