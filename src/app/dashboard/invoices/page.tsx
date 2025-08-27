import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { InvoiceGenerator } from '@/components/invoices/invoice-generator'

export default async function InvoicesPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/signin')
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
          <p className="mt-2 text-gray-600">
            Generate professional invoices for your projects and send them to clients.
          </p>
        </div>

        <InvoiceGenerator />
      </div>
    </DashboardLayout>
  )
}