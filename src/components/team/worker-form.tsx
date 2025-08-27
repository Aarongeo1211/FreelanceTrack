'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { User, Mail, Phone, Star, DollarSign } from 'lucide-react'

interface WorkerFormData {
  name: string
  email: string
  phone: string
  skills: string
  hourlyRate: number | null
}

interface WorkerFormProps {
  worker?: any
  isEditing?: boolean
}

export function WorkerForm({ worker, isEditing = false }: WorkerFormProps) {
  const router = useRouter()
  const [formData, setFormData] = useState<WorkerFormData>({
    name: worker?.name || '',
    email: worker?.email || '',
    phone: worker?.phone || '',
    skills: worker?.skills || '',
    hourlyRate: worker?.hourlyRate || null,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'hourlyRate' ? (value === '' ? null : parseFloat(value)) : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const url = isEditing ? `/api/workers/${worker.id}` : '/api/workers'
      const method = isEditing ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        router.push('/dashboard/team')
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
        <CardTitle>{isEditing ? 'Edit Team Member' : 'Add New Team Member'}</CardTitle>
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
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                <User className="inline h-4 w-4 mr-1" />
                Full Name *
              </label>
              <Input
                id="name"
                name="name"
                type="text"
                required
                placeholder="Enter team member's name"
                value={formData.name}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="inline h-4 w-4 mr-1" />
                Email Address
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="member@example.com"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="inline h-4 w-4 mr-1" />
                Phone Number
              </label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={formData.phone}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label htmlFor="hourlyRate" className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="inline h-4 w-4 mr-1" />
                Hourly Rate (₹)
              </label>
              <Input
                id="hourlyRate"
                name="hourlyRate"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.hourlyRate ?? ''}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div>
            <label htmlFor="skills" className="block text-sm font-medium text-gray-700 mb-2">
              <Star className="inline h-4 w-4 mr-1" />
              Skills & Expertise
            </label>
            <textarea
              id="skills"
              name="skills"
              rows={4}
              className="input resize-none"
              placeholder="List their skills, expertise, and areas of specialization..."
              value={formData.skills}
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
              {isLoading ? 'Saving...' : isEditing ? 'Update Team Member' : 'Add Team Member'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}