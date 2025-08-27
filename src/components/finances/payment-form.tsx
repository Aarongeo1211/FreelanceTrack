'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DollarSign, Calendar, FileText, User, FolderOpen } from 'lucide-react'

interface PaymentFormData {
  amount: number
  type: 'INCOMING' | 'OUTGOING'
  status: 'PENDING' | 'PAID' | 'OVERDUE'
  description: string
  clientId: string
  projectId: string
  workerId: string
  dueDate: string
  paidDate: string
}

interface Client {
  id: string
  name: string
  company?: string
}

interface Project {
  id: string
  name: string
  client: { name: string }
}

interface Worker {
  id: string
  name: string
  email?: string
}

export function PaymentForm() {
  const router = useRouter()
  const [formData, setFormData] = useState<PaymentFormData>({
    amount: 0,
    type: 'INCOMING',
    status: 'PENDING',
    description: '',
    clientId: '',
    projectId: '',
    workerId: '',
    dueDate: '',
    paidDate: '',
  })
  const [clients, setClients] = useState<Client[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [workers, setWorkers] = useState<Worker[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientsRes, projectsRes, workersRes] = await Promise.all([
          fetch('/api/clients'),
          fetch('/api/projects'),
          fetch('/api/workers')
        ])

        if (clientsRes.ok) {
          const clientsData = await clientsRes.json()
          setClients(clientsData)
        }

        if (projectsRes.ok) {
          const projectsData = await projectsRes.json()
          setProjects(projectsData)
        }

        if (workersRes.ok) {
          const workersData = await workersRes.json()
          setWorkers(workersData)
        }
      } catch (error) {
        console.error('Failed to fetch data:', error)
      }
    }

    fetchData()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) || 0 : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const payload = {
        ...formData,
        clientId: formData.clientId || undefined,
        projectId: formData.projectId || undefined,
        workerId: formData.workerId || undefined,
        dueDate: formData.dueDate || undefined,
        paidDate: formData.paidDate || undefined,
      }

      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        router.push('/dashboard/finances')
      } else {
        const data = await response.json()
        setError(data.error || 'An error occurred')
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Record New Payment</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="inline h-4 w-4 mr-1" />
                Amount *
              </label>
              <Input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                min="0"
                required
                placeholder="0.00"
                value={formData.amount || ''}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                Payment Type *
              </label>
              <select
                id="type"
                name="type"
                required
                className="input"
                value={formData.type}
                onChange={handleInputChange}
              >
                <option value="INCOMING">Income (from client)</option>
                <option value="OUTGOING">Expense (to team member)</option>
              </select>
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                id="status"
                name="status"
                className="input"
                value={formData.status}
                onChange={handleInputChange}
              >
                <option value="PENDING">Pending</option>
                <option value="PAID">Paid</option>
                <option value="OVERDUE">Overdue</option>
              </select>
            </div>

            {formData.type === 'INCOMING' && (
              <div>
                <label htmlFor="clientId" className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="inline h-4 w-4 mr-1" />
                  Client
                </label>
                <select
                  id="clientId"
                  name="clientId"
                  className="input"
                  value={formData.clientId}
                  onChange={handleInputChange}
                >
                  <option value="">Select client</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>
                      {client.name} {client.company && `(${client.company})`}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {formData.type === 'INCOMING' && (
              <div>
                <label htmlFor="projectId" className="block text-sm font-medium text-gray-700 mb-2">
                  <FolderOpen className="inline h-4 w-4 mr-1" />
                  Project
                </label>
                <select
                  id="projectId"
                  name="projectId"
                  className="input"
                  value={formData.projectId}
                  onChange={handleInputChange}
                >
                  <option value="">Select project</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>
                      {project.name} ({project.client.name})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {formData.type === 'OUTGOING' && (
              <div>
                <label htmlFor="workerId" className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="inline h-4 w-4 mr-1" />
                  Team Member
                </label>
                <select
                  id="workerId"
                  name="workerId"
                  className="input"
                  value={formData.workerId}
                  onChange={handleInputChange}
                >
                  <option value="">Select team member</option>
                  {workers.map(worker => (
                    <option key={worker.id} value={worker.id}>
                      {worker.name} {worker.email && `(${worker.email})`}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline h-4 w-4 mr-1" />
                Due Date
              </label>
              <Input
                id="dueDate"
                name="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={handleInputChange}
              />
            </div>

            {formData.status === 'PAID' && (
              <div>
                <label htmlFor="paidDate" className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="inline h-4 w-4 mr-1" />
                  Paid Date
                </label>
                <Input
                  id="paidDate"
                  name="paidDate"
                  type="date"
                  value={formData.paidDate}
                  onChange={handleInputChange}
                />
              </div>
            )}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="inline h-4 w-4 mr-1" />
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              className="input resize-none"
              placeholder="Payment description or notes..."
              value={formData.description}
              onChange={handleInputChange}
            />
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Record Payment'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}