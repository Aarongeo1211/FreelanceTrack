import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = session.user.id

    // Get the last 6 months of data
    const months = []
    const currentDate = new Date()
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1)
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0)
      
      const monthName = date.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
      
      // Get revenue (incoming payments) for this month
      const revenue = await db.payment.aggregate({
        where: {
          userId,
          type: 'INCOMING',
          status: 'PAID',
          paidDate: {
            gte: startOfMonth,
            lte: endOfMonth
          }
        },
        _sum: { amount: true }
      })

      // Get expenses (outgoing payments) for this month
      const expenses = await db.payment.aggregate({
        where: {
          userId,
          type: 'OUTGOING',
          status: 'PAID',
          paidDate: {
            gte: startOfMonth,
            lte: endOfMonth
          }
        },
        _sum: { amount: true }
      })

      months.push({
        month: monthName,
        revenue: revenue._sum.amount || 0,
        expenses: expenses._sum.amount || 0,
        profit: (revenue._sum.amount || 0) - (expenses._sum.amount || 0)
      })
    }

    return NextResponse.json(months)

  } catch (error) {
    console.error('Financial chart data error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}