import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const clientSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email format').optional().or(z.literal('').transform(() => undefined)),
  phone: z.string().optional().or(z.literal('').transform(() => undefined)),
  company: z.string().optional().or(z.literal('').transform(() => undefined)),
  address: z.string().optional().or(z.literal('').transform(() => undefined)),
  notes: z.string().optional().or(z.literal('').transform(() => undefined)),
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

    const client = await db.client.findFirst({
      where: {
        id: id,
        userId: session.user.id,
      },
      include: {
        projects: {
          include: {
            _count: {
              select: { tasks: true }
            }
          }
        },
        _count: {
          select: {
            projects: true,
            payments: true
          }
        }
      }
    })

    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(client)

  } catch (error) {
    console.error('Get client error:', error)
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
    const validatedData = clientSchema.parse(body)

    // Check if client exists and belongs to user
    const existingClient = await db.client.findFirst({
      where: {
        id: id,
        userId: session.user.id,
      }
    })

    if (!existingClient) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      )
    }

    const client = await db.client.update({
      where: { id: id },
      data: {
        ...validatedData,
        email: validatedData.email || null,
      },
      include: {
        _count: {
          select: { projects: true }
        }
      }
    })

    return NextResponse.json(client)

  } catch (error) {
    console.error('Update client error:', error)
    
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

    // Check if client exists and belongs to user
    const existingClient = await db.client.findFirst({
      where: {
        id: id,
        userId: session.user.id,
      },
      include: {
        _count: {
          select: { projects: true }
        }
      }
    })

    if (!existingClient) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      )
    }

    // Check if client has projects
    if (existingClient._count.projects > 0) {
      return NextResponse.json(
        { error: 'Cannot delete client with existing projects' },
        { status: 400 }
      )
    }

    await db.client.delete({
      where: { id: id }
    })

    return NextResponse.json({ message: 'Client deleted successfully' })

  } catch (error) {
    console.error('Delete client error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}