import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const workerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email format').optional().or(z.literal('').transform(() => undefined)),
  phone: z.string().optional().or(z.literal('').transform(() => undefined)),
  skills: z.string().optional().or(z.literal('').transform(() => undefined)),
  hourlyRate: z.number().min(0, 'Hourly rate must be 0 or greater').optional().nullable(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'ARCHIVED']).optional().default('ACTIVE'),
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

    const worker = await db.worker.findFirst({
      where: {
        id: id,
        userId: session.user.id,
      },
      include: {
        tasks: {
          include: {
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
            }
          }
        },
        payments: {
          select: {
            id: true,
            amount: true,
            status: true,
            createdAt: true
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

    if (!worker) {
      return NextResponse.json(
        { error: 'Worker not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(worker)

  } catch (error) {
    console.error('Get worker error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
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
    const validatedData = workerSchema.parse(body)

    // Check if worker exists and belongs to user
    const existingWorker = await db.worker.findFirst({
      where: {
        id: id,
        userId: session.user.id,
      }
    })

    if (!existingWorker) {
      return NextResponse.json(
        { error: 'Worker not found' },
        { status: 404 }
      )
    }

    const worker = await db.worker.update({
      where: { id: id },
      data: {
        ...validatedData,
        email: validatedData.email || null,
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

    return NextResponse.json(worker)

  } catch (error) {
    console.error('Update worker error:', error)
    
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

    // Check if worker exists and belongs to user
    const existingWorker = await db.worker.findFirst({
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

    if (!existingWorker) {
      return NextResponse.json(
        { error: 'Worker not found' },
        { status: 404 }
      )
    }

    // Check if worker has associated tasks or payments
    if (existingWorker._count.tasks > 0 || existingWorker._count.payments > 0) {
      return NextResponse.json(
        { error: 'Cannot delete worker with existing tasks or payments' },
        { status: 400 }
      )
    }

    await db.worker.delete({
      where: { id: id }
    })

    return NextResponse.json({ message: 'Worker deleted successfully' })

  } catch (error) {
    console.error('Delete worker error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}