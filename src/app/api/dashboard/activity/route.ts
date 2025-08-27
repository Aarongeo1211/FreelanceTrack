import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

interface ActivityItem {
  id: string
  type: 'client' | 'project' | 'task' | 'payment'
  title: string
  description: string
  timestamp: string
}

type RecentClient = {
  id: string
  name: string
  createdAt: Date
}

type RecentProject = {
  id: string
  name: string
  createdAt: Date
  client: { name: string }
}

type RecentTask = {
  id: string
  title: string
  createdAt: Date
  project: {
    name: string
    client: { name: string }
  }
}

type RecentPayment = {
  id: string
  amount: number
  type: string
  status: string
  createdAt: Date
  client?: { name: string } | null
  project?: { name: string } | null
  worker?: { name: string } | null
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

    const userId = session.user.id

    // Get recent activities from different entities
    const [recentClients, recentProjects, recentTasks, recentPayments] = await Promise.all([
      // Recent clients
      db.client.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 3,
        select: {
          id: true,
          name: true,
          createdAt: true,
        }
      }),

      // Recent projects
      db.project.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 3,
        include: {
          client: { select: { name: true } }
        }
      }),

      // Recent tasks
      db.task.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 3,
        include: {
          project: { 
            select: { 
              name: true,
              client: { select: { name: true } }
            }
          }
        }
      }),

      // Recent payments
      db.payment.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 3,
        include: {
          client: { select: { name: true } },
          project: { select: { name: true } },
          worker: { select: { name: true } }
        }
      })
    ])

    // Combine and format activities
    const activities: ActivityItem[] = []

    // Add client activities
    recentClients.forEach((client: RecentClient) => {
      activities.push({
        id: `client-${client.id}`,
        type: 'client',
        title: `New client added`,
        description: `${client.name} was added to your client list`,
        timestamp: client.createdAt.toISOString()
      })
    })

    // Add project activities
    recentProjects.forEach((project: RecentProject) => {
      activities.push({
        id: `project-${project.id}`,
        type: 'project',
        title: `New project created`,
        description: `${project.name} for ${project.client.name}`,
        timestamp: project.createdAt.toISOString()
      })
    })

    // Add task activities
    recentTasks.forEach((task: RecentTask) => {
      activities.push({
        id: `task-${task.id}`,
        type: 'task',
        title: `New task created`,
        description: `${task.title} in ${task.project.name}`,
        timestamp: task.createdAt.toISOString()
      })
    })

    // Add payment activities
    recentPayments.forEach((payment: RecentPayment) => {
      const entityName = payment.client?.name || payment.worker?.name || payment.project?.name || 'Unknown'
      const direction = payment.type === 'INCOMING' ? 'received from' : 'paid to'
      
      activities.push({
        id: `payment-${payment.id}`,
        type: 'payment',
        title: `Payment ${payment.status.toLowerCase()}`,
        description: `₹${payment.amount} ${direction} ${entityName}`,
        timestamp: payment.createdAt.toISOString()
      })
    })

    // Sort by timestamp and take the most recent 10
    const sortedActivities = activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10)

    return NextResponse.json(sortedActivities)

  } catch (error) {
    console.error('Dashboard activity error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}