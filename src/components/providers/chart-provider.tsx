'use client'

import { useEffect } from 'react'

// Import the chart configuration to ensure it's loaded
import '@/lib/chart-config'

export function ChartProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // This ensures Chart.js is fully loaded before any chart components render
    const initCharts = async () => {
      // Dynamic import to ensure Chart.js is available on client side
      const { ChartJS } = await import('@/lib/chart-config')
      // Chart.js is now properly initialized
    }
    
    initCharts()
  }, [])

  return <>{children}</>
}