import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const updateProjectSchema = z.object({
  status: z.enum(['ACTIVE', 'COMPLETED', 'ON_HOLD', 'CANCELLED']),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const project = await db.project.findFirst({
      where: {
        id: id,
        userId: session.user.id,
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            company: true
          }
        },
        tasks: {
          select: {
            cost: true
          }
        },
        payments: {
          select: {
            amount: true,
            status: true
          }
        },
        _count: {
          select: { 
            tasks: true,
            payments: true
          }
        }
      }
    })

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    // Calculate totalCost and paidAmount
    const tasksTotal = project.tasks.reduce((sum: number, task: any) => sum + (task.cost || 0), 0)
    const paidAmount = project.payments
      .filter((payment: any) => payment.status === 'PAID')
      .reduce((sum: number, payment: any) => sum + payment.amount, 0)
    
    // Use budget as totalCost if no tasks with costs exist, otherwise use tasks total
    const totalCost = tasksTotal > 0 ? tasksTotal : (project.budget || 0)
    
    // Update the project in database if values have changed
    if (project.totalCost !== totalCost || project.paidAmount !== paidAmount) {
      await db.project.update({
        where: { id: project.id },
        data: {
          totalCost,
          paidAmount
        }
      })
    }

    const projectWithCalculations = {
      ...project,
      totalCost,
      paidAmount,
      tasks: undefined, // Remove tasks from response
      payments: undefined // Remove payments from response
    }

    return NextResponse.json(projectWithCalculations)

  } catch (error) {
    console.error('Get project error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = updateProjectSchema.parse(body)

    // Check if project exists and belongs to user
    const existingProject = await db.project.findFirst({
      where: {
        id: id,
        userId: session.user.id,
      }
    })

    if (!existingProject) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    const project = await db.project.update({
      where: { id: id },
      data: {
        status: validatedData.status,
        // Update endDate when project is completed
        ...(validatedData.status === 'COMPLETED' && !existingProject.endDate && {
          endDate: new Date()
        })
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            company: true
          }
        },
        _count: {
          select: { 
            tasks: true,
            payments: true
          }
        }
      }
    })

    return NextResponse.json(project)

  } catch (error) {
    console.error('Update project error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if project exists and belongs to user
    const existingProject = await db.project.findFirst({
      where: {
        id: id,
        userId: session.user.id,
      },
      include: {
        _count: {
          select: { 
            tasks: true,
            payments: true
          }
        }
      }
    })

    if (!existingProject) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    // Check if project has tasks or payments
    if (existingProject._count.tasks > 0) {
      return NextResponse.json(
        { error: 'Cannot delete project with existing tasks' },
        { status: 400 }
      )
    }

    if (existingProject._count.payments > 0) {
      return NextResponse.json(
        { error: 'Cannot delete project with existing payments' },
        { status: 400 }
      )
    }

    await db.project.delete({
      where: { id: id }
    })

    return NextResponse.json({ message: 'Project deleted successfully' })

  } catch (error) {
    console.error('Delete project error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}