import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  projectId: z.string().min(1, 'Project is required'),
  assignedToId: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  estimatedHours: z.number().positive().optional(),
  hourlyRate: z.number().positive().optional(),
  dueDate: z.string().optional(),
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

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const projectId = searchParams.get('projectId')

    const where: any = { userId: session.user.id }
    
    if (status && ['TODO', 'IN_PROGRESS', 'REVIEW', 'COMPLETED', 'CANCELLED'].includes(status)) {
      where.status = status
    }
    
    if (priority && ['LOW', 'MEDIUM', 'HIGH', 'URGENT'].includes(priority)) {
      where.priority = priority
    }

    if (projectId) {
      where.projectId = projectId
    }

    const tasks = await db.task.findMany({
      where,
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
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(tasks)

  } catch (error) {
    console.error('Get tasks error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = taskSchema.parse(body)

    // Verify project belongs to user
    const project = await db.project.findFirst({
      where: {
        id: validatedData.projectId,
        userId: session.user.id
      }
    })

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
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

    // Calculate cost if hourly rate and estimated hours are provided
    const cost = (validatedData.hourlyRate && validatedData.estimatedHours) 
      ? validatedData.hourlyRate * validatedData.estimatedHours 
      : 0

    const task = await db.task.create({
      data: {
        ...validatedData,
        cost,
        dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : null,
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

    // Update project's totalCost
    await updateProjectTotalCost(validatedData.projectId)

    return NextResponse.json(task, { status: 201 })

  } catch (error) {
    console.error('Create task error:', error)
    
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