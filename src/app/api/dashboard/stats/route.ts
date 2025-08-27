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

    // Get current month dates
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

    // Fetch all statistics in parallel
    const [
      totalClients,
      activeProjects,
      pendingTasks,
      totalRevenue,
      pendingPayments,
      monthlyRevenue,
    ] = await Promise.all([
      // Total clients
      db.client.count({
        where: { userId, status: 'ACTIVE' }
      }),

      // Active projects
      db.project.count({
        where: { userId, status: 'ACTIVE' }
      }),

      // Pending tasks
      db.task.count({
        where: { 
          userId, 
          status: { in: ['TODO', 'IN_PROGRESS'] }
        }
      }),

      // Total revenue (sum of paid incoming payments)
      db.payment.aggregate({
        where: {
          userId,
          type: 'INCOMING',
          status: 'PAID'
        },
        _sum: { amount: true }
      }),

      // Pending payments (sum of pending incoming payments)
      db.payment.aggregate({
        where: {
          userId,
          type: 'INCOMING',
          status: 'PENDING'
        },
        _sum: { amount: true }
      }),

      // Monthly revenue (current month)
      db.payment.aggregate({
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
    ])

    const stats = {
      totalClients,
      activeProjects,
      pendingTasks,
      totalRevenue: totalRevenue._sum.amount || 0,
      pendingPayments: pendingPayments._sum.amount || 0,
      monthlyRevenue: monthlyRevenue._sum.amount || 0,
    }

    return NextResponse.json(stats)

  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}