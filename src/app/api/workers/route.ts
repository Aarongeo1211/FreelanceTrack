import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const workerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  skills: z.string().optional(),
  hourlyRate: z.number().min(0, 'Hourly rate must be 0 or greater').optional().nullable(),
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

    const workers = await db.worker.findMany({
      where: { userId: session.user.id },
      include: {
        _count: {
          select: { 
            tasks: true,
            payments: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(workers)

  } catch (error) {
    console.error('Get workers error:', error)
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
    const validatedData = workerSchema.parse(body)

    const worker = await db.worker.create({
      data: {
        ...validatedData,
        email: validatedData.email || null,
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

    return NextResponse.json(worker, { status: 201 })

  } catch (error) {
    console.error('Create worker error:', error)
    
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