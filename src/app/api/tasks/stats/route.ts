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

    // Fetch task statistics in parallel
    const [
      totalTasks,
      completedTasks,
      pendingTasks,
      overdueTasks,
      totalValue,
      completedValue,
    ] = await Promise.all([
      // Total tasks
      db.task.count({
        where: { userId }
      }),

      // Completed tasks
      db.task.count({
        where: { 
          userId,
          status: 'COMPLETED'
        }
      }),

      // Pending tasks (TODO + IN_PROGRESS + REVIEW)
      db.task.count({
        where: { 
          userId,
          status: { in: ['TODO', 'IN_PROGRESS', 'REVIEW'] }
        }
      }),

      // Overdue tasks (past due date and not completed)
      db.task.count({
        where: {
          userId,
          status: { not: 'COMPLETED' },
          dueDate: {
            lt: new Date()
          }
        }
      }),

      // Total value of all tasks
      db.task.aggregate({
        where: { userId },
        _sum: { cost: true }
      }),

      // Value of completed tasks
      db.task.aggregate({
        where: { 
          userId,
          status: 'COMPLETED'
        },
        _sum: { cost: true }
      })
    ])

    const stats = {
      totalTasks,
      completedTasks,
      pendingTasks,
      overdueTasks,
      totalValue: totalValue._sum.cost || 0,
      completedValue: completedValue._sum.cost || 0,
    }

    return NextResponse.json(stats)

  } catch (error) {
    console.error('Task stats error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}