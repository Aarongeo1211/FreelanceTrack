import { NextRequest, NextResponse } from 'next/server'

const defaultTemplates = [
  {
    id: 'modern',
    name: 'modern',
    displayName: 'Modern',
    description: 'Clean and contemporary design with bold typography',
    isDefault: true,
    isActive: true,
    layout: 'two-column',
    colorScheme: 'blue',
    headerStyle: 'logo-focused'
  },
  {
    id: 'classic',
    name: 'classic',
    displayName: 'Classic',
    description: 'Traditional business invoice with professional formatting',
    isDefault: false,
    isActive: true,
    layout: 'single-column',
    colorScheme: 'gray',
    headerStyle: 'minimal'
  },
  {
    id: 'minimal',
    name: 'minimal',
    displayName: 'Minimal',
    description: 'Simple, clean design focusing on clarity',
    isDefault: false,
    isActive: true,
    layout: 'single-column',
    colorScheme: 'gray',
    headerStyle: 'minimal'
  },
  {
    id: 'corporate',
    name: 'corporate',
    displayName: 'Corporate',
    description: 'Professional corporate design with emphasis on branding',
    isDefault: false,
    isActive: true,
    layout: 'header-focused',
    colorScheme: 'blue',
    headerStyle: 'bold'
  },
  {
    id: 'creative',
    name: 'creative',
    displayName: 'Creative',
    description: 'Unique design with creative elements and colors',
    isDefault: false,
    isActive: true,
    layout: 'two-column',
    colorScheme: 'purple',
    headerStyle: 'logo-focused'
  }
]

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json(defaultTemplates)
  } catch (error) {
    console.error('Get invoice templates error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}