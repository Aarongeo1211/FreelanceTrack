import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const updatePaymentSchema = z.object({
  status: z.enum(['PENDING', 'PAID', 'OVERDUE', 'CANCELLED']).optional(),
  amount: z.number().positive().optional(),
  type: z.enum(['INCOMING', 'OUTGOING']).optional(),
  description: z.string().optional(),
  clientId: z.string().optional(),
  projectId: z.string().optional(),
  workerId: z.string().optional(),
  dueDate: z.string().optional(),
  paidDate: z.string().optional(),
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

    const payment = await db.payment.findFirst({
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

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(payment)

  } catch (error) {
    console.error('Get payment error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

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
    console.log('Payment update request body:', body)
    const validatedData = updatePaymentSchema.parse(body)
    console.log('Validated payment data:', validatedData)

    // Validate relationships if they are being updated
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

    // Check if payment exists and belongs to user
    const existingPayment = await db.payment.findFirst({
      where: {
        id: id,
        userId: session.user.id,
      }
    })

    if (!existingPayment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      )
    }

    const payment = await db.payment.update({
      where: { id: id },
      data: {
        ...validatedData,
        clientId: validatedData.clientId || null,
        projectId: validatedData.projectId || null,
        workerId: validatedData.workerId || null,
        dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : undefined,
        paidDate: validatedData.paidDate ? new Date(validatedData.paidDate) : undefined,
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

    console.log('Payment updated successfully:', { id: payment.id, status: payment.status, amount: payment.amount })

    // Update project's paidAmount if payment is linked to a project
    if (payment.projectId) {
      await updateProjectPaidAmount(payment.projectId)
    }

    return NextResponse.json(payment)

  } catch (error) {
    console.error('Update payment error:', error)
    
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

    // Check if payment exists and belongs to user
    const existingPayment = await db.payment.findFirst({
      where: {
        id: id,
        userId: session.user.id,
      }
    })

    if (!existingPayment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      )
    }

    const projectId = existingPayment.projectId

    await db.payment.delete({
      where: { id: id }
    })

    // Update project's paidAmount if payment was linked to a project
    if (projectId) {
      await updateProjectPaidAmount(projectId)
    }

    return NextResponse.json({ message: 'Payment deleted successfully' })

  } catch (error) {
    console.error('Delete payment error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}