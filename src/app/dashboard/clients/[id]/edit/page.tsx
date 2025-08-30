'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { ClientForm } from '@/components/clients/client-form'
import { Card, CardContent } from '@/components/ui/card'

export default function EditClientPage() {
  const params = useParams()
  const [client, setClient] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchClient = async () => {
      try {
        const response = await fetch(`/api/clients/${params.id}`)
        if (response.ok) {
          const data = await response.json()
          setClient(data)
        } else {
          setError('Client not found')
        }
      } catch (error) {
        console.error('Failed to fetch client:', error)
        setError('Failed to load client')
      } finally {
        setIsLoading(false)
      }
    }

    if (params.id) {
      fetchClient()
    }
  }, [params.id])

  if (isLoading) {
    return (
      <Card className="max-w-2xl">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="max-w-2xl">
        <CardContent className="p-6">
          <div className="text-center py-8">
            <div className="text-red-600 mb-4">{error}</div>
            <button 
              onClick={() => window.history.back()}
              className="text-blue-600 hover:text-blue-800"
            >
              Go Back
            </button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return <ClientForm client={client} isEditing={true} />
}