'use client'

import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, UserPlus, FolderPlus, CheckSquare, DollarSign, FileText } from 'lucide-react'

export function QuickActions() {
  const actions = [
    {
      title: 'Add Client',
      description: 'Create a new client profile',
      href: '/dashboard/clients/new',
      icon: UserPlus,
      color: 'bg-blue-500 hover:bg-blue-600',
    },
    {
      title: 'New Project',
      description: 'Start a new project',
      href: '/dashboard/projects/new',
      icon: FolderPlus,
      color: 'bg-green-500 hover:bg-green-600',
    },
    {
      title: 'Generate Invoice',
      description: 'Create client invoice',
      href: '/dashboard/invoices',
      icon: FileText,
      color: 'bg-indigo-500 hover:bg-indigo-600',
    },
    {
      title: 'Create Task',
      description: 'Add a new task',
      href: '/dashboard/tasks/new',
      icon: CheckSquare,
      color: 'bg-yellow-500 hover:bg-yellow-600',
    },
    {
      title: 'Record Payment',
      description: 'Log a payment',
      href: '/dashboard/finances/payments/new',
      icon: DollarSign,
      color: 'bg-purple-500 hover:bg-purple-600',
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {actions.map((action, index) => {
            const Icon = action.icon
            return (
              <Link key={index} href={action.href}>
                <Button
                  variant="outline"
                  className="w-full justify-start h-auto p-4 hover:bg-gray-50"
                >
                  <div className={`p-2 rounded-md ${action.color} mr-3`}>
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-gray-900">{action.title}</div>
                    <div className="text-sm text-gray-500">{action.description}</div>
                  </div>
                </Button>
              </Link>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}