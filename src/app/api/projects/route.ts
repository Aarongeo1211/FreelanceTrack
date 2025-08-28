import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const projectSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  clientId: z.string().min(1, 'Client is required'),
  budget: z.number().optional(),
  hourlyRate: z.number().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const projects = await db.project.findMany({
      where: { userId: session.user.id },
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
      },
      orderBy: { createdAt: 'desc' }
    })

    // Calculate totalCost and paidAmount for each project
    const projectsWithCalculations = projects.map((project: any) => {
      const tasksTotal = project.tasks.reduce((sum: number, task: any) => sum + (task.cost || 0), 0)
      const paidAmount = project.payments
        .filter((payment: any) => payment.status === 'PAID')
        .reduce((sum: number, payment: any) => sum + payment.amount, 0)
      
      // Use budget as totalCost if no tasks with costs exist, otherwise use tasks total
      const totalCost = tasksTotal > 0 ? tasksTotal : (project.budget || 0)
      
      // Update the project in database if values have changed
      if (project.totalCost !== totalCost || project.paidAmount !== paidAmount) {
        db.project.update({
          where: { id: project.id },
          data: {
            totalCost,
            paidAmount
          }
        }).catch(console.error) // Don't await to avoid blocking the response
      }

      return {
        ...project,
        totalCost,
        paidAmount,
        tasks: undefined, // Remove tasks from response
        payments: undefined // Remove payments from response
      }
    })

    return NextResponse.json(projectsWithCalculations)

  } catch (error) {
    console.error('Get projects error:', error)
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
    const validatedData = projectSchema.parse(body)

    // Verify client belongs to user
    const client = await db.client.findFirst({
      where: {
        id: validatedData.clientId,
        userId: session.user.id
      }
    })

    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      )
    }

    const project = await db.project.create({
      data: {
        ...validatedData,
        startDate: validatedData.startDate ? new Date(validatedData.startDate) : null,
        endDate: validatedData.endDate ? new Date(validatedData.endDate) : null,
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
        _count: {
          select: { 
            tasks: true,
            payments: true
          }
        }
      }
    })

    return NextResponse.json(project, { status: 201 })

  } catch (error) {
    console.error('Create project error:', error)
    
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