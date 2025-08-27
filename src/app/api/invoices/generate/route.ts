import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

interface ProjectWithClientAndTasks {
  id: string
  name: string
  description?: string | null
  status: string
  totalCost: number
  client: {
    id: string
    name: string
    email?: string | null
    company?: string | null
    address?: string | null
  }
  tasks: {
    id: string
    title: string
    description?: string | null
    actualHours: number
    hourlyRate?: number | null
    cost: number
    completedAt?: Date | null
  }[]
}

interface LineItem {
  type: 'project' | 'task'
  description: string
  quantity: number
  rate: number
  amount: number
}

interface InvoiceData {
  invoiceNumber: string
  issueDate: string
  dueDate?: string | null
  freelancer: {
    name: string
    email: string
    address: string
    phone: string
  }
  client: {
    id: string
    name: string
    email?: string | null
    company?: string | null
    address?: string | null
  }
  projects: {
    id: string
    name: string
    description?: string | null
    status: string
    totalCost: number
    completedTasks: number
  }[]
  lineItems: LineItem[]
  subtotal: number
  tax: number
  total: number
  notes: string
  paymentTerms: string
  createdAt: string
  status: string
}

const invoiceSchema = z.object({
  projectIds: z.array(z.string()).min(1, 'At least one project must be selected'),
  invoiceNumber: z.string().min(1, 'Invoice number is required'),
  dueDate: z.string().optional(),
  notes: z.string().optional(),
})

export async function GET() {
  return NextResponse.json({ status: 'Invoice API is working' })
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
    const validatedData = invoiceSchema.parse(body)

    const userId = session.user.id

    // Get user information
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Get projects with tasks and client information
    const projects = await db.project.findMany({
      where: {
        id: { in: validatedData.projectIds },
        userId: userId
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            company: true,
            address: true
          }
        },
        tasks: {
          where: {
            status: 'COMPLETED'
          },
          select: {
            id: true,
            title: true,
            description: true,
            actualHours: true,
            hourlyRate: true,
            cost: true,
            completedAt: true
          }
        }
      }
    })

    if (projects.length === 0) {
      return NextResponse.json(
        { error: 'No projects found' },
        { status: 404 }
      )
    }

    if (projects.length !== validatedData.projectIds.length) {
      return NextResponse.json(
        { error: 'Some projects were not found or do not belong to you' },
        { status: 400 }
      )
    }

    // Validate that all projects belong to the same client
    const clientIds: string[] = Array.from(new Set(projects.map(p => p.client.id)))
    if (clientIds.length > 1) {
      return NextResponse.json(
        { error: 'All projects must belong to the same client for a single invoice' },
        { status: 400 }
      )
    }

    // Calculate totals
    let subtotal = 0
    const lineItems: LineItem[] = []

    projects.forEach((project) => {
      // Add project as a line item
      const lineItem: LineItem = {
        type: 'project',
        description: `${project.name}${project.description ? ` - ${project.description}` : ''}`,
        quantity: 1,
        rate: project.totalCost,
        amount: project.totalCost
      }
      lineItems.push(lineItem)
      subtotal += project.totalCost

      // Optionally add completed tasks as detailed line items
      // Uncomment if you want task-level breakdown
      /*
      project.tasks.forEach((task) => {
        if (task.cost > 0) {
          const taskLineItem: LineItem = {
            type: 'task',
            description: `  └─ ${task.title}`,
            quantity: task.actualHours || 1,
            rate: task.hourlyRate || 0,
            amount: task.cost
          }
          lineItems.push(taskLineItem)
        }
      })
      */
    })

    // Generate invoice data
    const invoiceData: InvoiceData = {
      invoiceNumber: validatedData.invoiceNumber,
      issueDate: new Date().toISOString(),
      dueDate: validatedData.dueDate ? new Date(validatedData.dueDate).toISOString() : null,
      
      // Freelancer information (Aaron George Abraham from Bengaluru)
      freelancer: {
        name: user.name || 'Aaron George Abraham',
        email: user.email || 'aarongeo1211@gmail.com',
        address: "Bengaluru, Karnataka, India",
        phone: "+91-9876543210" // Update with actual phone number
      },
      
      // Client information (using first project's client)
      client: projects[0].client,
      
      // Project details
      projects: projects.map((project) => ({
        id: project.id,
        name: project.name,
        description: project.description,
        status: project.status,
        totalCost: project.totalCost,
        completedTasks: project.tasks.length
      })),
      
      // Line items
      lineItems,
      
      // Calculations
      subtotal,
      tax: 0, // You can add tax calculation here
      total: subtotal,
      
      // Additional info
      notes: validatedData.notes || (projects.length > 1 ? 
        `Invoice for ${projects.length} projects: ${projects.map(p => p.name).join(', ')}` : 
        `Invoice for project: ${projects[0].name}`),
      
      // Payment terms
      paymentTerms: "Payment is due within 30 days of invoice date.",
      
      // Invoice metadata
      createdAt: new Date().toISOString(),
      status: 'PENDING'
    }

    return NextResponse.json(invoiceData)

  } catch (error) {
    console.error('Generate invoice error:', error)
    
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