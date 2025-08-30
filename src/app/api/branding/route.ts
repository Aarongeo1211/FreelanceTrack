import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const brandingSchema = z.object({
  businessName: z.string().optional(),
  businessAddress: z.string().optional(),
  businessPhone: z.string().optional(),
  businessEmail: z.string().email().optional().or(z.literal('').transform(() => undefined)),
  website: z.string().url().optional().or(z.literal('').transform(() => undefined)),
  taxNumber: z.string().optional(),
  logoUrl: z.string().url().optional().or(z.literal('').transform(() => undefined)),
  primaryColor: z.string().default('#3B82F6'),
  secondaryColor: z.string().default('#1F2937'),
  accentColor: z.string().default('#10B981'),
  fontFamily: z.string().default('Inter'),
  defaultTemplate: z.string().default('modern'),
  showLogo: z.boolean().default(true),
  showBusinessInfo: z.boolean().default(true),
  invoicePrefix: z.string().default('INV'),
  bankName: z.string().optional(),
  accountNumber: z.string().optional(),
  routingNumber: z.string().optional(),
  paypalEmail: z.string().email().optional().or(z.literal('').transform(() => undefined)),
  footerText: z.string().optional(),
  termsConditions: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const brandingSettings = await db.brandingSettings.findUnique({
      where: { userId: session.user.id }
    })

    // Return default settings if none exist
    if (!brandingSettings) {
      const defaultSettings = {
        businessName: session.user.name || 'Aaron George Abraham',
        businessAddress: 'Bengaluru, Karnataka, India',
        businessEmail: session.user.email || 'aarongeo1211@gmail.com',
        businessPhone: '+91-9876543210',
        primaryColor: '#3B82F6',
        secondaryColor: '#1F2937',
        accentColor: '#10B981',
        fontFamily: 'Inter',
        defaultTemplate: 'modern',
        showLogo: true,
        showBusinessInfo: true,
        invoicePrefix: 'INV',
        footerText: 'Thank you for your business!',
        termsConditions: 'Payment is due within 30 days of invoice date.'
      }
      return NextResponse.json(defaultSettings)
    }

    return NextResponse.json(brandingSettings)

  } catch (error) {
    console.error('Get branding settings error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = brandingSchema.parse(body)

    // Upsert branding settings
    const brandingSettings = await db.brandingSettings.upsert({
      where: { userId: session.user.id },
      update: {
        ...validatedData,
        businessEmail: validatedData.businessEmail || null,
        website: validatedData.website || null,
        logoUrl: validatedData.logoUrl || null,
        paypalEmail: validatedData.paypalEmail || null,
      },
      create: {
        userId: session.user.id,
        ...validatedData,
        businessEmail: validatedData.businessEmail || null,
        website: validatedData.website || null,
        logoUrl: validatedData.logoUrl || null,
        paypalEmail: validatedData.paypalEmail || null,
      }
    })

    return NextResponse.json(brandingSettings)

  } catch (error) {
    console.error('Save branding settings error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}