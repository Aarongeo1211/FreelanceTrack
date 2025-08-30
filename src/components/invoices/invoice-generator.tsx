'use client'

import { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatCurrency, formatDate } from '@/lib/utils'
import { FileText, Download, Send, Check, Calendar, DollarSign, Palette, Settings } from 'lucide-react'
import { ModernTemplate, ClassicTemplate } from './templates'
import Link from 'next/link'

interface Project {
  id: string
  name: string
  description?: string
  status: string
  totalCost: number
  paidAmount: number
  client: {
    id: string
    name: string
    email?: string
    company?: string
  }
  _count: {
    tasks: number
  }
}

interface InvoiceData {
  invoiceNumber: string
  issueDate: string
  dueDate?: string
  freelancer: {
    name: string
    email: string
    address: string
    phone: string
  }
  client: {
    name: string
    email?: string
    company?: string
    address?: string
  }
  projects: Array<{
    id: string
    name: string
    description?: string
    totalCost: number
  }>
  lineItems: Array<{
    description: string
    quantity: number
    rate: number
    amount: number
  }>
  subtotal: number
  total: number
  notes: string
  paymentTerms: string
}

interface BrandingSettings {
  businessName?: string
  businessAddress?: string
  businessPhone?: string
  businessEmail?: string
  logoUrl?: string
  primaryColor: string
  secondaryColor: string
  accentColor: string
  fontFamily: string
  defaultTemplate: string
  showLogo: boolean
  showBusinessInfo: boolean
  footerText?: string
  termsConditions?: string
}

interface InvoiceTemplate {
  id: string
  name: string
  displayName: string
  description: string
  isDefault: boolean
  isActive: boolean
  layout: string
  colorScheme: string
  headerStyle: string
}

export function InvoiceGenerator() {
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([])
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null)
  const [brandingSettings, setBrandingSettings] = useState<BrandingSettings | null>(null)
  const [templates, setTemplates] = useState<InvoiceTemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState('modern')
  const [formData, setFormData] = useState({
    invoiceNumber: `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
    dueDate: '',
    notes: ''
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectsRes, brandingRes, templatesRes] = await Promise.all([
          fetch('/api/projects'),
          fetch('/api/branding'),
          fetch('/api/invoice-templates')
        ])
        
        if (projectsRes.ok) {
          const data = await projectsRes.json()
          const activeProjects = data.filter((project: Project) => 
            project.status !== 'CANCELLED'
          )
          setProjects(activeProjects)
        }
        
        if (brandingRes.ok) {
          const brandingData = await brandingRes.json()
          setBrandingSettings(brandingData)
          setSelectedTemplate(brandingData.defaultTemplate || 'modern')
        }
        
        if (templatesRes.ok) {
          const templatesData = await templatesRes.json()
          setTemplates(templatesData)
        }
      } catch (error) {
        console.error('Failed to fetch data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const renderInvoiceTemplate = () => {
    if (!invoiceData || !brandingSettings) return null

    const templateProps = {
      invoiceData,
      brandingSettings
    }

    switch (selectedTemplate) {
      case 'classic':
        return <ClassicTemplate {...templateProps} />
      case 'modern':
      default:
        return <ModernTemplate {...templateProps} />
    }
  }

  const handleProjectSelection = (projectId: string) => {
    const project = projects.find(p => p.id === projectId)
    if (!project) return

    // If no projects selected yet, allow any project
    if (selectedProjectIds.length === 0) {
      setSelectedProjectIds([projectId])
      setSelectedClientId(project.client.id)
      return
    }

    // If project is already selected, remove it
    if (selectedProjectIds.includes(projectId)) {
      const newSelection = selectedProjectIds.filter(id => id !== projectId)
      setSelectedProjectIds(newSelection)
      
      // If no projects left, clear client selection
      if (newSelection.length === 0) {
        setSelectedClientId(null)
      }
      return
    }

    // Only allow adding projects from the same client
    if (selectedClientId && project.client.id === selectedClientId) {
      setSelectedProjectIds(prev => [...prev, projectId])
    } else {
      alert(`You can only select projects from the same client. Currently selected client: ${projects.find(p => p.client.id === selectedClientId)?.client.company || projects.find(p => p.client.id === selectedClientId)?.client.name}`)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const generateInvoice = async () => {
    if (selectedProjectIds.length === 0) {
      alert('Please select at least one project')
      return
    }

    setIsGenerating(true)
    try {
      const requestBody = {
        projectIds: selectedProjectIds,
        invoiceNumber: formData.invoiceNumber,
        dueDate: formData.dueDate || undefined,
        notes: formData.notes || undefined,
      }

      const response = await fetch('/api/invoices/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      if (response.ok) {
        const data = await response.json()
        setInvoiceData(data)
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }))
        console.error('Invoice generation failed:', errorData)
        alert(`Failed to generate invoice: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Failed to generate invoice:', error)
      alert(`Failed to generate invoice: ${error instanceof Error ? error.message : 'Network error'}`)
    } finally {
      setIsGenerating(false)
    }
  }

  const downloadInvoice = () => {
    if (!invoiceData) return
    
    // Create a downloadable PDF or print the invoice
    const printContent = document.getElementById('invoice-preview')
    if (printContent) {
      const printWindow = window.open('', '_blank')
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Invoice ${invoiceData.invoiceNumber}</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .invoice-header { text-align: center; margin-bottom: 30px; }
                .invoice-details { display: flex; justify-content: space-between; margin-bottom: 30px; }
                .invoice-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
                .invoice-table th, .invoice-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                .invoice-table th { background-color: #f2f2f2; }
                .total-section { text-align: right; }
                .payment-terms { margin-top: 30px; font-size: 12px; color: #666; }
              </style>
            </head>
            <body>
              ${printContent.innerHTML}
            </body>
          </html>
        `)
        printWindow.document.close()
        printWindow.print()
      }
    }
  }

  // Group projects by client
  const groupedProjects = projects.reduce((groups, project) => {
    const clientKey = project.client.id
    if (!groups[clientKey]) {
      groups[clientKey] = {
        client: project.client,
        projects: []
      }
    }
    groups[clientKey].projects.push(project)
    return groups
  }, {} as Record<string, { client: Project['client'], projects: Project[] }>)

  const selectedTotal = projects
    .filter(project => selectedProjectIds.includes(project.id))
    .reduce((sum, project) => sum + project.totalCost, 0)

  const getSelectedOutstanding = () => {
    return projects
      .filter(project => selectedProjectIds.includes(project.id))
      .reduce((sum, project) => sum + (project.totalCost - project.paidAmount), 0)
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Invoice Generator
            </CardTitle>
            <Link href="/dashboard/invoices/branding">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Branding Settings
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Invoice Details Form */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="invoiceNumber" className="block text-sm font-medium text-gray-700 mb-2">
                Invoice Number
              </label>
              <Input
                id="invoiceNumber"
                name="invoiceNumber"
                value={formData.invoiceNumber}
                onChange={handleInputChange}
                placeholder="INV-2024-001"
              />
            </div>
            <div>
              <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-2">
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
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selected Total {selectedProjectIds.length > 0 && `(${selectedProjectIds.length} project${selectedProjectIds.length !== 1 ? 's' : ''})`}
              </label>
              <div className="text-lg font-bold text-green-600">
                {formatCurrency(selectedTotal)}
              </div>
              {selectedProjectIds.length > 0 && (
                <div className="mt-1">
                  <div className="text-sm text-gray-600">
                    Outstanding: {formatCurrency(getSelectedOutstanding())}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Template Selection */}
          {templates.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Invoice Template
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => setSelectedTemplate(template.name)}
                    className={`p-3 border rounded-lg text-left transition-all ${
                      selectedTemplate === template.name
                        ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Palette className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-sm">{template.displayName}</span>
                    </div>
                    <p className="text-xs text-gray-600">{template.description}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
              Invoice Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Additional notes for the invoice..."
            />
          </div>

          {/* Project Selection */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Select Projects for Invoice
              {selectedClientId && (
                <span className="text-sm font-normal text-blue-600 ml-2">
                  (Client: {Object.values(groupedProjects).find(g => g.client.id === selectedClientId)?.client.company || Object.values(groupedProjects).find(g => g.client.id === selectedClientId)?.client.name})
                </span>
              )}
            </h3>
            
            {selectedProjectIds.length > 0 && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> You can only select multiple projects from the same client. 
                  {selectedProjectIds.length > 1 && `Currently selected: ${selectedProjectIds.length} projects`}
                </p>
                <div className="mt-2 flex items-center justify-between text-sm">
                  <div>
                    <span className="text-blue-700 font-medium">Total Amount: {formatCurrency(selectedTotal)}</span>
                  </div>
                  <div>
                    <span className="text-red-700 font-medium">Outstanding: {formatCurrency(getSelectedOutstanding())}</span>
                  </div>
                </div>
              </div>
            )}
            
            {Object.keys(groupedProjects).length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="mx-auto h-12 w-12 text-gray-300 mb-2" />
                <p>No active projects found.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.values(groupedProjects).map((group) => {
                  const isClientSelected = selectedClientId === group.client.id
                  const isClientDisabled = selectedClientId && selectedClientId !== group.client.id
                  
                  return (
                    <div key={group.client.id} className={`border rounded-lg p-4 ${
                      isClientDisabled ? 'opacity-50 bg-gray-50' : 'bg-white'
                    }`}>
                      {/* Client Header */}
                      <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {group.client.company || group.client.name}
                          </h4>
                          {group.client.company && group.client.name && (
                            <p className="text-sm text-gray-600">{group.client.name}</p>
                          )}
                          {group.client.email && (
                            <p className="text-xs text-gray-500">{group.client.email}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">
                            {group.projects.length} project{group.projects.length !== 1 ? 's' : ''}
                          </p>
                          {isClientSelected && (
                            <p className="text-xs text-green-600 font-medium">
                              {selectedProjectIds.filter(id => group.projects.some(p => p.id === id)).length} selected
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {/* Projects List */}
                      <div className="space-y-2">
                        {group.projects.map((project) => {
                          const projectAmount = project.totalCost
                          const outstandingAmount = project.totalCost - project.paidAmount
                          const isSelected = selectedProjectIds.includes(project.id)
                          const isDisabled = isClientDisabled
                          const hasOutstanding = outstandingAmount > 0
                          
                          return (
                            <div
                              key={project.id}
                              className={`border rounded p-3 transition-colors cursor-pointer ${
                                isDisabled ? 'cursor-not-allowed' :
                                isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
                              }`}
                              onClick={() => !isDisabled && handleProjectSelection(project.id)}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <div className={`w-4 h-4 border-2 rounded ${
                                    isSelected ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
                                  } flex items-center justify-center`}>
                                    {isSelected && <Check className="w-2.5 h-2.5 text-white" />}
                                  </div>
                                  <div>
                                    <h5 className="font-medium text-gray-900">{project.name}</h5>
                                    {project.description && (
                                      <p className="text-xs text-gray-500 truncate max-w-xs">{project.description}</p>
                                    )}
                                    
                                    {/* Payment Status Information */}
                                    <div className="flex items-center space-x-4 mt-1">
                                      {project.paidAmount > 0 && (
                                        <p className="text-xs text-green-600">
                                          Paid: {formatCurrency(project.paidAmount)}
                                        </p>
                                      )}
                                      {hasOutstanding && (
                                        <p className="text-xs font-medium text-red-600">
                                          Outstanding: {formatCurrency(outstandingAmount)}
                                        </p>
                                      )}
                                      {!hasOutstanding && project.paidAmount > 0 && (
                                        <span className="text-xs font-medium text-green-600">✓ Fully Paid</span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-lg font-medium text-gray-900">
                                    {formatCurrency(projectAmount)}
                                  </div>
                                  {hasOutstanding && (
                                    <div className="text-sm font-medium text-red-600">
                                      {formatCurrency(outstandingAmount)} due
                                    </div>
                                  )}
                                  <div className="text-xs text-gray-500">
                                    {project._count.tasks} task{project._count.tasks !== 1 ? 's' : ''}
                                  </div>
                                  <div className={`text-xs font-medium ${
                                    project.status === 'ACTIVE' ? 'text-green-600' :
                                    project.status === 'COMPLETED' ? 'text-blue-600' :
                                    project.status === 'ON_HOLD' ? 'text-yellow-600' :
                                    'text-gray-600'
                                  }`}>
                                    {project.status.replace('_', ' ')}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <div>
              {selectedProjectIds.length > 0 && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedProjectIds([])
                    setSelectedClientId(null)
                  }}
                  className="text-gray-600 hover:text-gray-700"
                >
                  Clear Selection
                </Button>
              )}
            </div>
            <Button
              onClick={generateInvoice}
              disabled={isGenerating || selectedProjectIds.length === 0}
              className="flex items-center"
            >
              <FileText className="w-4 h-4 mr-2" />
              {isGenerating ? 'Generating...' : `Generate Invoice${selectedProjectIds.length > 1 ? ` (${selectedProjectIds.length} projects)` : ''}`}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Invoice Preview */}
      {invoiceData && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Invoice Preview</CardTitle>
              <div className="flex space-x-2">
                <Button onClick={downloadInvoice} variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Download/Print
                </Button>
                <Button>
                  <Send className="w-4 h-4 mr-2" />
                  Send to Client
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div id="invoice-preview" className="bg-white border rounded-lg overflow-hidden">
              {renderInvoiceTemplate()}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}