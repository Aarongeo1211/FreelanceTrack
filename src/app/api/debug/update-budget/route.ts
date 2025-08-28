import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const updateBudgetSchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
  budget: z.number().min(0, 'Budget must be positive')
})

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
    const validatedData = updateBudgetSchema.parse(body)

    // Check if project exists and belongs to user
    const existingProject = await db.project.findFirst({
      where: {
        id: validatedData.projectId,
        userId: session.user.id,
      }
    })

    if (!existingProject) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    // Update project budget and totalCost
    const updatedProject = await db.project.update({
      where: { id: validatedData.projectId },
      data: {
        budget: validatedData.budget,
        totalCost: validatedData.budget // Set totalCost to budget amount
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            company: true
          }
        }
      }
    })

    return NextResponse.json({
      message: 'Project budget updated successfully',
      project: {
        id: updatedProject.id,
        name: updatedProject.name,
        budget: updatedProject.budget,
        totalCost: updatedProject.totalCost,
        paidAmount: updatedProject.paidAmount,
        outstanding: updatedProject.totalCost - updatedProject.paidAmount,
        client: updatedProject.client
      }
    })

  } catch (error) {
    console.error('Update budget error:', error)
    
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