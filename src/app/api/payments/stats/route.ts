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

    // Fetch all payment statistics in parallel
    const [
      totalIncomingPaid,
      totalOutgoingPaid,
      pendingIncoming,
      pendingOutgoing,
      overdueCount,
    ] = await Promise.all([
      // Total incoming payments (paid)
      db.payment.aggregate({
        where: {
          userId,
          type: 'INCOMING',
          status: 'PAID'
        },
        _sum: { amount: true }
      }),

      // Total outgoing payments (paid)
      db.payment.aggregate({
        where: {
          userId,
          type: 'OUTGOING',
          status: 'PAID'
        },
        _sum: { amount: true }
      }),

      // Pending incoming payments
      db.payment.aggregate({
        where: {
          userId,
          type: 'INCOMING',
          status: 'PENDING'
        },
        _sum: { amount: true }
      }),

      // Pending outgoing payments
      db.payment.aggregate({
        where: {
          userId,
          type: 'OUTGOING',
          status: 'PENDING'
        },
        _sum: { amount: true }
      }),

      // Overdue payments count
      db.payment.count({
        where: {
          userId,
          status: 'OVERDUE'
        }
      })
    ])

    const paidIncoming = totalIncomingPaid._sum.amount || 0
    const paidOutgoing = totalOutgoingPaid._sum.amount || 0
    const pendingIncomingAmount = pendingIncoming._sum.amount || 0
    const pendingOutgoingAmount = pendingOutgoing._sum.amount || 0

    const stats = {
      totalIncoming: paidIncoming + pendingIncomingAmount,
      totalOutgoing: paidOutgoing + pendingOutgoingAmount,
      pendingIncoming: pendingIncomingAmount,
      pendingOutgoing: pendingOutgoingAmount,
      paidIncoming,
      paidOutgoing,
      overduePayments: overdueCount,
      netProfit: paidIncoming - paidOutgoing,
    }

    return NextResponse.json(stats)

  } catch (error) {
    console.error('Payment stats error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}