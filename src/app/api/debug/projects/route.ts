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

    // Get detailed project information for debugging
    const projects = await db.project.findMany({
      where: { userId: session.user.id },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            company: true
          }
        },
        tasks: {
          select: {
            id: true,
            title: true,
            cost: true,
            hourlyRate: true,
            estimatedHours: true,
            actualHours: true,
            status: true
          }
        },
        payments: {
          select: {
            id: true,
            amount: true,
            status: true,
            type: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Add calculations for debugging
    const debugData = projects.map(project => {
      const tasksCost = project.tasks.reduce((sum, task) => sum + (task.cost || 0), 0)
      const paidAmount = project.payments
        .filter(payment => payment.status === 'PAID')
        .reduce((sum, payment) => sum + payment.amount, 0)
      
      // Use budget as totalCost if no tasks with costs exist
      const finalTotalCost = tasksCost > 0 ? tasksCost : (project.budget || 0)
      
      return {
        id: project.id,
        name: project.name,
        status: project.status,
        budget: project.budget,
        database_totalCost: project.totalCost,
        database_paidAmount: project.paidAmount,
        calculated_tasksTotal: tasksCost,
        calculated_finalCost: finalTotalCost,
        calculated_paidAmount: paidAmount,
        outstanding: Math.max(0, finalTotalCost - paidAmount),
        hasTasksWithCosts: tasksCost > 0,
        usingBudgetAsCost: tasksCost === 0 && project.budget > 0,
        client: project.client,
        tasks: project.tasks.map(task => ({
          id: task.id,
          title: task.title,
          cost: task.cost,
          hourlyRate: task.hourlyRate,
          estimatedHours: task.estimatedHours,
          actualHours: task.actualHours,
          status: task.status
        })),
        payments: project.payments
      }
    })

    return NextResponse.json({
      message: 'Debug information for projects',
      totalProjects: projects.length,
      projects: debugData
    })

  } catch (error) {
    console.error('Debug projects error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}