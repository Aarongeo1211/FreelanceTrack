'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { formatCurrency, formatDate, getInitials } from '@/lib/utils'
import { Search, Edit, Trash2, Mail, Phone, Star, User, DollarSign } from 'lucide-react'

interface Worker {
  id: string
  name: string
  email?: string
  phone?: string
  skills?: string
  hourlyRate?: number
  totalEarned: number
  totalPaid: number
  status: string
  joinedAt: string
  createdAt: string
  _count: {
    tasks: number
    payments: number
  }
}

export function WorkersTable() {
  const [workers, setWorkers] = useState<Worker[]>([])
  const [filteredWorkers, setFilteredWorkers] = useState<Worker[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        const response = await fetch('/api/workers')
        if (response.ok) {
          const data = await response.json()
          setWorkers(data)
          setFilteredWorkers(data)
        }
      } catch (error) {
        console.error('Failed to fetch workers:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchWorkers()
  }, [])

  useEffect(() => {
    const filtered = workers.filter(worker =>
      worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      worker.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      worker.skills?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredWorkers(filtered)
  }, [searchTerm, workers])

  const handleDeleteWorker = async (workerId: string) => {
    if (!confirm('Are you sure you want to delete this team member? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/workers/${workerId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setWorkers(workers.filter(worker => worker.id !== workerId))
      } else {
        alert('Failed to delete team member')
      }
    } catch (error) {
      console.error('Failed to delete worker:', error)
      alert('Failed to delete team member')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800'
      case 'INACTIVE':
        return 'bg-yellow-100 text-yellow-800'
      case 'ARCHIVED':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-gray-200 rounded w-80"></div>
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-6">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search team members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Workers List */}
        {filteredWorkers.length === 0 ? (
          <div className="text-center py-12">
            <User className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No team members found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? 'Try adjusting your search terms.' : 'Get started by adding your first team member.'}
            </p>
            {!searchTerm && (
              <div className="mt-6">
                <Link href="/dashboard/team/new">
                  <Button>Add your first team member</Button>
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredWorkers.map((worker) => (
              <div key={worker.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-medium text-sm">
                            {getInitials(worker.name)}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-lg font-medium text-gray-900">{worker.name}</h3>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(worker.status)}`}>
                            {worker.status}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
                          {worker.email && (
                            <div className="flex items-center">
                              <Mail className="w-4 h-4 mr-1" />
                              {worker.email}
                            </div>
                          )}
                          {worker.phone && (
                            <div className="flex items-center">
                              <Phone className="w-4 h-4 mr-1" />
                              {worker.phone}
                            </div>
                          )}
                          {worker.hourlyRate && (
                            <div className="flex items-center">
                              <DollarSign className="w-4 h-4 mr-1" />
                              {formatCurrency(worker.hourlyRate)}/hr
                            </div>
                          )}
                        </div>

                        {worker.skills && (
                          <div className="flex items-center text-sm text-gray-600 mb-2">
                            <Star className="w-4 h-4 mr-1" />
                            <span>{worker.skills}</span>
                          </div>
                        )}

                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>{worker._count.tasks} task{worker._count.tasks !== 1 ? 's' : ''}</span>
                          <span>{worker._count.payments} payment{worker._count.payments !== 1 ? 's' : ''}</span>
                          <span>Earned: {formatCurrency(worker.totalEarned)}</span>
                          <span>Paid: {formatCurrency(worker.totalPaid)}</span>
                          {worker.totalEarned > worker.totalPaid && (
                            <span className="text-red-600 font-medium">
                              Owe: {formatCurrency(worker.totalEarned - worker.totalPaid)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className="text-right text-sm text-gray-500">
                      <div>Joined {formatDate(worker.joinedAt)}</div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <Link href={`/dashboard/team/${worker.id}/edit`}>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteWorker(worker.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}