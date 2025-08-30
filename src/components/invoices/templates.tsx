'use client'

import { formatCurrency, formatDate } from '@/lib/utils'

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
  showLogo: boolean
  showBusinessInfo: boolean
  footerText?: string
  termsConditions?: string
}

interface InvoiceTemplateProps {
  invoiceData: InvoiceData
  brandingSettings: BrandingSettings
}

export function ModernTemplate({ invoiceData, brandingSettings }: InvoiceTemplateProps) {
  return (
    <div 
      className="bg-white p-8 max-w-4xl mx-auto"
      style={{ fontFamily: brandingSettings.fontFamily }}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div className="flex items-center gap-4">
          {brandingSettings.showLogo && brandingSettings.logoUrl && (
            <img 
              src={brandingSettings.logoUrl} 
              alt="Logo" 
              className="h-16 w-16 object-contain"
            />
          )}
          <div>
            <h1 
              className="text-4xl font-bold"
              style={{ color: brandingSettings.primaryColor }}
            >
              INVOICE
            </h1>
            <p className="text-lg text-gray-600">#{invoiceData.invoiceNumber}</p>
          </div>
        </div>
        
        {brandingSettings.showBusinessInfo && (
          <div className="text-right">
            <h2 className="text-xl font-semibold text-gray-900">
              {brandingSettings.businessName || invoiceData.freelancer.name}
            </h2>
            <div className="text-gray-600 mt-2">
              <p>{brandingSettings.businessEmail || invoiceData.freelancer.email}</p>
              <p>{brandingSettings.businessPhone || invoiceData.freelancer.phone}</p>
              <p className="whitespace-pre-line">
                {brandingSettings.businessAddress || invoiceData.freelancer.address}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Invoice Details */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h3 
            className="text-lg font-semibold mb-2"
            style={{ color: brandingSettings.secondaryColor }}
          >
            Bill To:
          </h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="font-medium text-gray-900">
              {invoiceData.client.company || invoiceData.client.name}
            </p>
            {invoiceData.client.company && invoiceData.client.name && (
              <p className="text-gray-700">{invoiceData.client.name}</p>
            )}
            {invoiceData.client.email && (
              <p className="text-gray-700">{invoiceData.client.email}</p>
            )}
            {invoiceData.client.address && (
              <p className="text-gray-700 whitespace-pre-line">{invoiceData.client.address}</p>
            )}
          </div>
        </div>
        
        <div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="font-medium text-gray-700">Issue Date:</span>
              <span className="text-gray-900">{formatDate(invoiceData.issueDate)}</span>
            </div>
            {invoiceData.dueDate && (
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Due Date:</span>
                <span className="text-gray-900">{formatDate(invoiceData.dueDate)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Line Items */}
      <div className="mb-8">
        <table className="w-full border-collapse">
          <thead>
            <tr style={{ backgroundColor: brandingSettings.primaryColor }}>
              <th className="text-left py-3 px-4 text-white font-semibold">Description</th>
              <th className="text-right py-3 px-4 text-white font-semibold">Qty</th>
              <th className="text-right py-3 px-4 text-white font-semibold">Rate</th>
              <th className="text-right py-3 px-4 text-white font-semibold">Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoiceData.lineItems.map((item, index) => (
              <tr key={index} className="border-b border-gray-200">
                <td className="py-3 px-4 text-gray-900">{item.description}</td>
                <td className="text-right py-3 px-4 text-gray-700">{item.quantity}</td>
                <td className="text-right py-3 px-4 text-gray-700">{formatCurrency(item.rate)}</td>
                <td className="text-right py-3 px-4 text-gray-900 font-medium">
                  {formatCurrency(item.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="flex justify-end mb-8">
        <div className="w-80">
          <div className="flex justify-between py-2 border-b border-gray-200">
            <span className="font-medium text-gray-700">Subtotal:</span>
            <span className="text-gray-900">{formatCurrency(invoiceData.subtotal)}</span>
          </div>
          <div 
            className="flex justify-between py-3 text-xl font-bold text-white px-4 rounded"
            style={{ backgroundColor: brandingSettings.primaryColor }}
          >
            <span>Total Amount:</span>
            <span>{formatCurrency(invoiceData.total)}</span>
          </div>
        </div>
      </div>

      {/* Notes and Terms */}
      <div className="space-y-6">
        {invoiceData.notes && (
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Notes:</h4>
            <p className="text-gray-700">{invoiceData.notes}</p>
          </div>
        )}
        
        <div>
          <h4 className="font-semibold text-gray-900 mb-2">Payment Terms:</h4>
          <p className="text-gray-700">
            {brandingSettings.termsConditions || invoiceData.paymentTerms}
          </p>
        </div>
        
        {brandingSettings.footerText && (
          <div className="text-center pt-6 border-t border-gray-200">
            <p className="text-gray-600">{brandingSettings.footerText}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export function ClassicTemplate({ invoiceData, brandingSettings }: InvoiceTemplateProps) {
  return (
    <div 
      className="bg-white p-8 max-w-4xl mx-auto"
      style={{ fontFamily: brandingSettings.fontFamily }}
    >
      {/* Header */}
      <div className="text-center mb-8 pb-6 border-b-2 border-gray-300">
        {brandingSettings.showLogo && brandingSettings.logoUrl && (
          <img 
            src={brandingSettings.logoUrl} 
            alt="Logo" 
            className="h-20 mx-auto mb-4"
          />
        )}
        <h1 className="text-3xl font-bold text-gray-900 mb-2">INVOICE</h1>
        <p className="text-lg text-gray-600">#{invoiceData.invoiceNumber}</p>
      </div>

      {/* Business and Client Info */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-3 underline">From:</h3>
          <div>
            <p className="font-semibold text-gray-900">
              {brandingSettings.businessName || invoiceData.freelancer.name}
            </p>
            <p className="text-gray-700">{brandingSettings.businessEmail || invoiceData.freelancer.email}</p>
            <p className="text-gray-700">{brandingSettings.businessPhone || invoiceData.freelancer.phone}</p>
            <p className="text-gray-700 whitespace-pre-line">
              {brandingSettings.businessAddress || invoiceData.freelancer.address}
            </p>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-3 underline">To:</h3>
          <div>
            <p className="font-semibold text-gray-900">
              {invoiceData.client.company || invoiceData.client.name}
            </p>
            {invoiceData.client.company && invoiceData.client.name && (
              <p className="text-gray-700">{invoiceData.client.name}</p>
            )}
            {invoiceData.client.email && (
              <p className="text-gray-700">{invoiceData.client.email}</p>
            )}
            {invoiceData.client.address && (
              <p className="text-gray-700 whitespace-pre-line">{invoiceData.client.address}</p>
            )}
          </div>
        </div>
      </div>

      {/* Invoice Details */}
      <div className="mb-8">
        <table className="w-full">
          <tr>
            <td className="font-semibold text-gray-700 py-1">Issue Date:</td>
            <td className="text-gray-900 py-1">{formatDate(invoiceData.issueDate)}</td>
          </tr>
          {invoiceData.dueDate && (
            <tr>
              <td className="font-semibold text-gray-700 py-1">Due Date:</td>
              <td className="text-gray-900 py-1">{formatDate(invoiceData.dueDate)}</td>
            </tr>
          )}
        </table>
      </div>

      {/* Line Items */}
      <div className="mb-8">
        <table className="w-full border border-gray-400">
          <thead>
            <tr className="bg-gray-100">
              <th className="text-left py-3 px-4 border-r border-gray-400 font-bold">Description</th>
              <th className="text-center py-3 px-4 border-r border-gray-400 font-bold">Quantity</th>
              <th className="text-right py-3 px-4 border-r border-gray-400 font-bold">Rate</th>
              <th className="text-right py-3 px-4 font-bold">Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoiceData.lineItems.map((item, index) => (
              <tr key={index} className="border-b border-gray-400">
                <td className="py-3 px-4 border-r border-gray-400">{item.description}</td>
                <td className="text-center py-3 px-4 border-r border-gray-400">{item.quantity}</td>
                <td className="text-right py-3 px-4 border-r border-gray-400">{formatCurrency(item.rate)}</td>
                <td className="text-right py-3 px-4 font-semibold">{formatCurrency(item.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Total */}
      <div className="flex justify-end mb-8">
        <div className="w-60">
          <div className="flex justify-between py-2 border-b border-gray-400">
            <span className="font-semibold">Subtotal:</span>
            <span>{formatCurrency(invoiceData.subtotal)}</span>
          </div>
          <div className="flex justify-between py-3 text-xl font-bold border-b-2 border-gray-900">
            <span>TOTAL:</span>
            <span>{formatCurrency(invoiceData.total)}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="space-y-4 text-sm">
        {invoiceData.notes && (
          <div>
            <h4 className="font-bold text-gray-900 mb-1">Notes:</h4>
            <p className="text-gray-700">{invoiceData.notes}</p>
          </div>
        )}
        
        <div>
          <h4 className="font-bold text-gray-900 mb-1">Terms & Conditions:</h4>
          <p className="text-gray-700">
            {brandingSettings.termsConditions || invoiceData.paymentTerms}
          </p>
        </div>
        
        {brandingSettings.footerText && (
          <div className="text-center pt-4 border-t border-gray-300">
            <p className="text-gray-600 italic">{brandingSettings.footerText}</p>
          </div>
        )}
      </div>
    </div>
  )
}