'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Palette, 
  Building, 
  Mail, 
  Phone, 
  Globe, 
  CreditCard, 
  FileText, 
  Save,
  Upload,
  Eye
} from 'lucide-react'

interface BrandingSettings {
  businessName?: string
  businessAddress?: string
  businessPhone?: string
  businessEmail?: string
  website?: string
  taxNumber?: string
  logoUrl?: string
  primaryColor: string
  secondaryColor: string
  accentColor: string
  fontFamily: string
  defaultTemplate: string
  showLogo: boolean
  showBusinessInfo: boolean
  invoicePrefix: string
  bankName?: string
  accountNumber?: string
  routingNumber?: string
  paypalEmail?: string
  footerText?: string
  termsConditions?: string
}

const fontOptions = [
  { value: 'Inter', label: 'Inter (Modern)' },
  { value: 'Roboto', label: 'Roboto (Clean)' },
  { value: 'Open Sans', label: 'Open Sans (Friendly)' },
  { value: 'Lato', label: 'Lato (Professional)' },
  { value: 'Montserrat', label: 'Montserrat (Bold)' },
  { value: 'Poppins', label: 'Poppins (Trendy)' },
  { value: 'Georgia', label: 'Georgia (Serif)' },
  { value: 'Times New Roman', label: 'Times New Roman (Classic)' }
]

const colorPresets = [
  { name: 'Ocean Blue', primary: '#3B82F6', secondary: '#1E40AF', accent: '#06B6D4' },
  { name: 'Forest Green', primary: '#10B981', secondary: '#047857', accent: '#84CC16' },
  { name: 'Royal Purple', primary: '#8B5CF6', secondary: '#7C3AED', accent: '#A855F7' },
  { name: 'Sunset Orange', primary: '#F59E0B', secondary: '#D97706', accent: '#EF4444' },
  { name: 'Professional Gray', primary: '#6B7280', secondary: '#374151', accent: '#3B82F6' },
  { name: 'Deep Navy', primary: '#1E3A8A', secondary: '#1E293B', accent: '#06B6D4' }
]

export function BrandingSettings() {
  const [settings, setSettings] = useState<BrandingSettings>({
    primaryColor: '#3B82F6',
    secondaryColor: '#1F2937',
    accentColor: '#10B981',
    fontFamily: 'Inter',
    defaultTemplate: 'modern',
    showLogo: true,
    showBusinessInfo: true,
    invoicePrefix: 'INV'
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('business')

  useEffect(() => {
    fetchBrandingSettings()
  }, [])

  const fetchBrandingSettings = async () => {
    try {
      const response = await fetch('/api/branding')
      if (response.ok) {
        const data = await response.json()
        setSettings(data)
      }
    } catch (error) {
      console.error('Failed to fetch branding settings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof BrandingSettings, value: string | boolean) => {
    setSettings(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/branding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      })

      if (response.ok) {
        // Show success message or toast
        console.log('Branding settings saved successfully')
      } else {
        console.error('Failed to save branding settings')
      }
    } catch (error) {
      console.error('Error saving branding settings:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const applyColorPreset = (preset: typeof colorPresets[0]) => {
    setSettings(prev => ({
      ...prev,
      primaryColor: preset.primary,
      secondaryColor: preset.secondary,
      accentColor: preset.accent
    }))
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'business', label: 'Business Info', icon: Building },
    { id: 'branding', label: 'Branding', icon: Palette },
    { id: 'invoice', label: 'Invoice Settings', icon: FileText },
    { id: 'payment', label: 'Payment Info', icon: CreditCard }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Invoice Branding</h1>
          <p className="text-gray-600 mt-2">
            Customize your invoice templates and business branding
          </p>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={isSaving}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Business Information Tab */}
      {activeTab === 'business' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Business Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="businessName">Business Name</Label>
                <Input
                  id="businessName"
                  value={settings.businessName || ''}
                  onChange={(e) => handleInputChange('businessName', e.target.value)}
                  placeholder="Your Business Name"
                />
              </div>
              
              <div>
                <Label htmlFor="businessEmail">Business Email</Label>
                <Input
                  id="businessEmail"
                  type="email"
                  value={settings.businessEmail || ''}
                  onChange={(e) => handleInputChange('businessEmail', e.target.value)}
                  placeholder="business@example.com"
                />
              </div>
              
              <div>
                <Label htmlFor="businessPhone">Phone Number</Label>
                <Input
                  id="businessPhone"
                  value={settings.businessPhone || ''}
                  onChange={(e) => handleInputChange('businessPhone', e.target.value)}
                  placeholder="+91-9876543210"
                />
              </div>
              
              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={settings.website || ''}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  placeholder="https://yourwebsite.com"
                />
              </div>
              
              <div>
                <Label htmlFor="taxNumber">Tax Number / GST</Label>
                <Input
                  id="taxNumber"
                  value={settings.taxNumber || ''}
                  onChange={(e) => handleInputChange('taxNumber', e.target.value)}
                  placeholder="Tax identification number"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Business Address</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="businessAddress">Full Address</Label>
                <Textarea
                  id="businessAddress"
                  value={settings.businessAddress || ''}
                  onChange={(e) => handleInputChange('businessAddress', e.target.value)}
                  placeholder="Street Address, City, State, PIN Code, Country"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Branding Tab */}
      {activeTab === 'branding' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Logo & Visual Identity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="logoUrl">Logo URL</Label>
                <Input
                  id="logoUrl"
                  value={settings.logoUrl || ''}
                  onChange={(e) => handleInputChange('logoUrl', e.target.value)}
                  placeholder="https://example.com/logo.png"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Upload your logo to a hosting service and paste the URL here
                </p>
              </div>

              <div className="space-y-3">
                <Label>Font Family</Label>
                <select
                  value={settings.fontFamily}
                  onChange={(e) => handleInputChange('fontFamily', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {fontOptions.map((font) => (
                    <option key={font.value} value={font.value}>
                      {font.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.showLogo}
                    onChange={(e) => handleInputChange('showLogo', e.target.checked)}
                    className="mr-2"
                  />
                  Show Logo on Invoices
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.showBusinessInfo}
                    onChange={(e) => handleInputChange('showBusinessInfo', e.target.checked)}
                    className="mr-2"
                  />
                  Show Business Info
                </label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Color Scheme
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Color Presets */}
              <div>
                <Label>Color Presets</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {colorPresets.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => applyColorPreset(preset)}
                      className="flex items-center gap-2 p-2 border rounded-md hover:bg-gray-50 text-left"
                    >
                      <div className="flex gap-1">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: preset.primary }}
                        />
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: preset.secondary }}
                        />
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: preset.accent }}
                        />
                      </div>
                      <span className="text-sm">{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Colors */}
              <div className="space-y-3">
                <div>
                  <Label htmlFor="primaryColor">Primary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="primaryColor"
                      type="color"
                      value={settings.primaryColor}
                      onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={settings.primaryColor}
                      onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                      placeholder="#3B82F6"
                      className="flex-1"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="secondaryColor">Secondary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="secondaryColor"
                      type="color"
                      value={settings.secondaryColor}
                      onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={settings.secondaryColor}
                      onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
                      placeholder="#1F2937"
                      className="flex-1"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="accentColor">Accent Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="accentColor"
                      type="color"
                      value={settings.accentColor}
                      onChange={(e) => handleInputChange('accentColor', e.target.value)}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={settings.accentColor}
                      onChange={(e) => handleInputChange('accentColor', e.target.value)}
                      placeholder="#10B981"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Invoice Settings Tab */}
      {activeTab === 'invoice' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Invoice Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="invoicePrefix">Invoice Number Prefix</Label>
                <Input
                  id="invoicePrefix"
                  value={settings.invoicePrefix}
                  onChange={(e) => handleInputChange('invoicePrefix', e.target.value)}
                  placeholder="INV"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Example: INV-2024-000001
                </p>
              </div>

              <div>
                <Label htmlFor="defaultTemplate">Default Template</Label>
                <select
                  id="defaultTemplate"
                  value={settings.defaultTemplate}
                  onChange={(e) => handleInputChange('defaultTemplate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="modern">Modern</option>
                  <option value="classic">Classic</option>
                  <option value="minimal">Minimal</option>
                  <option value="corporate">Corporate</option>
                  <option value="creative">Creative</option>
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="footerText">Invoice Footer Text</Label>
              <Textarea
                id="footerText"
                value={settings.footerText || ''}
                onChange={(e) => handleInputChange('footerText', e.target.value)}
                placeholder="Thank you for your business!"
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="termsConditions">Terms & Conditions</Label>
              <Textarea
                id="termsConditions"
                value={settings.termsConditions || ''}
                onChange={(e) => handleInputChange('termsConditions', e.target.value)}
                placeholder="Payment is due within 30 days of invoice date."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Information Tab */}
      {activeTab === 'payment' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bankName">Bank Name</Label>
                <Input
                  id="bankName"
                  value={settings.bankName || ''}
                  onChange={(e) => handleInputChange('bankName', e.target.value)}
                  placeholder="State Bank of India"
                />
              </div>

              <div>
                <Label htmlFor="accountNumber">Account Number</Label>
                <Input
                  id="accountNumber"
                  value={settings.accountNumber || ''}
                  onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                  placeholder="123456789"
                />
              </div>

              <div>
                <Label htmlFor="routingNumber">IFSC Code</Label>
                <Input
                  id="routingNumber"
                  value={settings.routingNumber || ''}
                  onChange={(e) => handleInputChange('routingNumber', e.target.value)}
                  placeholder="SBIN0001234"
                />
              </div>

              <div>
                <Label htmlFor="paypalEmail">PayPal Email</Label>
                <Input
                  id="paypalEmail"
                  type="email"
                  value={settings.paypalEmail || ''}
                  onChange={(e) => handleInputChange('paypalEmail', e.target.value)}
                  placeholder="payments@yoursite.com"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}