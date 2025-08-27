import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const paymentSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  type: z.enum(['INCOMING', 'OUTGOING']),
  status: z.enum(['PENDING', 'PAID', 'OVERDUE', 'CANCELLED']).default('PENDING'),
  description: z.string().optional(),
  clientId: z.string().optional(),
  projectId: z.string().optional(),
  workerId: z.string().optional(),
  dueDate: z.string().optional(),
  paidDate: z.string().optional(),
})

// Helper function to update project's paidAmount
async function updateProjectPaidAmount(projectId: string) {
  if (!projectId) return
  
  // Calculate total paid amount for this project
  const paidAmount = await db.payment.aggregate({
    where: {
      projectId,
      status: 'PAID'
    },
    _sum: {
      amount: true
    }
  })

  // Update project's paidAmount
  await db.project.update({
    where: { id: projectId },
    data: {
      paidAmount: paidAmount._sum.amount || 0
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
    const type = searchParams.get('type')
    const status = searchParams.get('status')

    const where: any = { userId: session.user.id }
    
    if (type && ['INCOMING', 'OUTGOING'].includes(type)) {
      where.type = type
    }
    
    if (status && ['PENDING', 'PAID', 'OVERDUE', 'CANCELLED'].includes(status)) {
      where.status = status
    }

    const payments = await db.payment.findMany({
      where,
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            company: true
          }
        },
        project: {
          select: {
            id: true,
            name: true,
            client: {
              select: {
                name: true
              }
            }
          }
        },
        worker: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(payments)

  } catch (error) {
    console.error('Get payments error:', error)
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
    const validatedData = paymentSchema.parse(body)

    // Validate relationships
    if (validatedData.clientId) {
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
    }

    if (validatedData.projectId) {
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
    }

    if (validatedData.workerId) {
      const worker = await db.worker.findFirst({
        where: {
          id: validatedData.workerId,
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

    const payment = await db.payment.create({
      data: {
        ...validatedData,
        dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : null,
        paidDate: validatedData.paidDate ? new Date(validatedData.paidDate) : null,
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
        project: {
          select: {
            id: true,
            name: true,
            client: {
              select: {
                name: true
              }
            }
          }
        },
        worker: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    // Update project's paidAmount if payment is linked to a project
    if (validatedData.projectId) {
      await updateProjectPaidAmount(validatedData.projectId)
    }

    return NextResponse.json(payment, { status: 201 })

  } catch (error) {
    console.error('Create payment error:', error)
    
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