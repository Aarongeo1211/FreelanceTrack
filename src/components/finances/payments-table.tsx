'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Search, Filter, DollarSign, TrendingUp, TrendingDown, Edit, Trash2 } from 'lucide-react'

interface Payment {
  id: string
  amount: number
  type: 'INCOMING' | 'OUTGOING'
  status: 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED'
  description?: string
  dueDate?: string
  paidDate?: string
  createdAt: string
  client?: {
    id: string
    name: string
    email?: string
    company?: string
  }
  project?: {
    id: string
    name: string
    client: {
      name: string
    }
  }
  worker?: {
    id: string
    name: string
    email?: string
  }
}

export function PaymentsTable() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'INCOMING' | 'OUTGOING'>('ALL')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'PAID' | 'OVERDUE'>('ALL')

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await fetch('/api/payments')
        if (response.ok) {
          const data = await response.json()
          setPayments(data)
          setFilteredPayments(data)
        }
      } catch (error) {
        console.error('Failed to fetch payments:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPayments()
  }, [])

  useEffect(() => {
    let filtered = payments

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(payment =>
        payment.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.client?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.project?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.worker?.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Apply type filter
    if (typeFilter !== 'ALL') {
      filtered = filtered.filter(payment => payment.type === typeFilter)
    }

    // Apply status filter
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(payment => payment.status === statusFilter)
    }

    setFilteredPayments(filtered)
  }, [searchTerm, typeFilter, statusFilter, payments])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'bg-green-100 text-green-800'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'OVERDUE':
        return 'bg-red-100 text-red-800'
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeIcon = (type: string) => {
    return type === 'INCOMING' ? (
      <TrendingUp className="h-4 w-4 text-green-600" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-600" />
    )
  }

  const getEntityName = (payment: Payment) => {
    if (payment.client) return payment.client.name
    if (payment.worker) return payment.worker.name
    if (payment.project) return `${payment.project.name} (${payment.project.client.name})`
    return 'Unknown'
  }

  const handleDeletePayment = async (paymentId: string) => {
    if (!confirm('Are you sure you want to delete this payment? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/payments/${paymentId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        // Remove the payment from state
        setPayments(prev => prev.filter(p => p.id !== paymentId))
        setFilteredPayments(prev => prev.filter(p => p.id !== paymentId))
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'Failed to delete payment')
      }
    } catch (error) {
      console.error('Failed to delete payment:', error)
      alert('Failed to delete payment')
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-gray-200 rounded w-80"></div>
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-6">
        {/* Filters */}
        <div className="mb-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search payments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex space-x-4">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="input w-auto"
            >
              <option value="ALL">All Types</option>
              <option value="INCOMING">Income</option>
              <option value="OUTGOING">Expenses</option>
            </select>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="input w-auto"
            >
              <option value="ALL">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="PAID">Paid</option>
              <option value="OVERDUE">Overdue</option>
            </select>
          </div>
        </div>

        {/* Payments List */}
        {filteredPayments.length === 0 ? (
          <div className="text-center py-12">
            <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No payments found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || typeFilter !== 'ALL' || statusFilter !== 'ALL' 
                ? 'Try adjusting your filters.' 
                : 'Start by recording your first payment.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPayments.map((payment) => (
              <div key={payment.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      {getTypeIcon(payment.type)}
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          {formatCurrency(payment.amount)}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {payment.type === 'INCOMING' ? 'From' : 'To'}: {getEntityName(payment)}
                        </p>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                        {payment.status}
                      </span>
                    </div>
                    
                    {payment.description && (
                      <p className="text-sm text-gray-600 mb-2">{payment.description}</p>
                    )}
                    
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>Created: {formatDate(payment.createdAt)}</span>
                      {payment.dueDate && (
                        <span>Due: {formatDate(payment.dueDate)}</span>
                      )}
                      {payment.paidDate && (
                        <span>Paid: {formatDate(payment.paidDate)}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <Link href={`/dashboard/finances/payments/${payment.id}/edit`}>
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDeletePayment(payment.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
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