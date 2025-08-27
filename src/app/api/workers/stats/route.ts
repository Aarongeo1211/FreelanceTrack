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

    // Fetch worker statistics
    const [
      totalWorkers,
      activeWorkers,
      workerStats,
      pendingPayments,
      averageRateResult
    ] = await Promise.all([
      // Total workers count
      db.worker.count({
        where: { userId }
      }),

      // Active workers count
      db.worker.count({
        where: { 
          userId,
          status: 'ACTIVE'
        }
      }),

      // Total earned and paid aggregates
      db.worker.aggregate({
        where: { userId },
        _sum: {
          totalEarned: true,
          totalPaid: true
        }
      }),

      // Pending payments to workers
      db.payment.aggregate({
        where: {
          userId,
          type: 'OUTGOING',
          status: 'PENDING'
        },
        _sum: { amount: true }
      }),

      // Average hourly rate
      db.worker.aggregate({
        where: {
          userId,
          hourlyRate: { not: null }
        },
        _avg: { hourlyRate: true }
      })
    ])

    const stats = {
      totalWorkers,
      activeWorkers,
      totalEarned: workerStats._sum.totalEarned || 0,
      totalPaid: workerStats._sum.totalPaid || 0,
      pendingPayments: pendingPayments._sum.amount || 0,
      averageRate: averageRateResult._avg.hourlyRate || 0,
    }

    return NextResponse.json(stats)

  } catch (error) {
    console.error('Worker stats error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}