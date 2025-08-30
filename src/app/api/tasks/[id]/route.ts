import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const updateTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  description: z.string().optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'REVIEW', 'COMPLETED', 'CANCELLED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  estimatedHours: z.number().positive().optional(),
  actualHours: z.number().min(0).optional(),
  hourlyRate: z.number().positive().optional(),
  dueDate: z.string().optional(),
  assignedToId: z.string().optional(),
})

// Helper function to update project's totalCost
async function updateProjectTotalCost(projectId: string) {
  if (!projectId) return
  
  // Calculate total cost from all tasks in this project
  const totalCostResult = await db.task.aggregate({
    where: {
      projectId
    },
    _sum: {
      cost: true
    }
  })

  // Update project's totalCost
  await db.project.update({
    where: { id: projectId },
    data: {
      totalCost: totalCostResult._sum.cost || 0
    }
  })
}

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

    const task = await db.task.findFirst({
      where: {
        id: id,
        userId: session.user.id,
      },
      include: {
        project: {
          include: {
            client: {
              select: {
                id: true,
                name: true,
                email: true,
                company: true
              }
            }
          }
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(task)

  } catch (error) {
    console.error('Get task error:', error)
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
    const validatedData = updateTaskSchema.parse(body)

    // Check if task exists and belongs to user
    const existingTask = await db.task.findFirst({
      where: {
        id: id,
        userId: session.user.id,
      }
    })

    if (!existingTask) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      )
    }

    // Verify worker belongs to user if assigned
    if (validatedData.assignedToId) {
      const worker = await db.worker.findFirst({
        where: {
          id: validatedData.assignedToId,
          userId: session.user.id
        }
      })

      if (!worker) {
        return NextResponse.json(
          { error: 'Worker not found' },
          { status: 404 }
        )
      }
    }

    // Calculate cost if relevant fields are updated
    let cost = existingTask.cost
    const hourlyRate = validatedData.hourlyRate !== undefined ? validatedData.hourlyRate : existingTask.hourlyRate
    const estimatedHours = validatedData.estimatedHours !== undefined ? validatedData.estimatedHours : existingTask.estimatedHours
    const actualHours = validatedData.actualHours !== undefined ? validatedData.actualHours : existingTask.actualHours

    if (hourlyRate && (estimatedHours || actualHours)) {
      cost = hourlyRate * (actualHours || estimatedHours || 0)
    }

    const updateData: any = {
      ...validatedData,
      cost,
      dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : undefined,
    }

    // Set completion timestamp if status is being changed to COMPLETED
    if (validatedData.status === 'COMPLETED' && existingTask.status !== 'COMPLETED') {
      updateData.completedAt = new Date()
    } else if (validatedData.status && validatedData.status !== 'COMPLETED') {
      updateData.completedAt = null
    }

    // Remove undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key]
      }
    })

    const task = await db.task.update({
      where: { id: id },
      data: updateData,
      include: {
        project: {
          include: {
            client: {
              select: {
                id: true,
                name: true,
                email: true,
                company: true
              }
            }
          }
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    // Update project's totalCost
    await updateProjectTotalCost(existingTask.projectId)

    return NextResponse.json(task)

  } catch (error) {
    console.error('Update task error:', error)
    
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

    // Check if task exists and belongs to user
    const existingTask = await db.task.findFirst({
      where: {
        id: id,
        userId: session.user.id,
      }
    })

    if (!existingTask) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      )
    }

    await db.task.delete({
      where: { id: id }
    })

    // Update project's totalCost
    await updateProjectTotalCost(existingTask.projectId)

    return NextResponse.json({ message: 'Task deleted successfully' })

  } catch (error) {
    console.error('Delete task error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}